

import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../exceptions/app.exception.js';
import { generateTokens } from '../utils/jwt.util.js';
import jwt from 'jsonwebtoken';
import { da } from 'zod/locales';
import { Role } from "@prisma/client";

// We will map this to our Zod schema later
export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
}

export class AuthService {

  async register(data: RegisterDTO) {
    // 1. Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      // 409 Conflict is the correct HTTP status when a resource already exists
      throw new AppError(409, 'User with this email already exists');
    }

    // 2. Hash the password
    // 10 salt rounds is standard for production (balances security and server CPU load)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    // 3. Create the user in the database
    const user = await userRepository.create({
      email: data.email,
      passwordHash: passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role
    });

    // 4. Generate Tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Note: In a full implementation, we should also save the refreshToken to the database here.
    // For now, we return the data to the controller.

    // 5. Remove passwordHash from the return object for security
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async loginUser(data: any) {
    // 1. Check karein ki user exist karta hai ya nahi
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error("Invalid email or password"); // Security ke liye kabhi nahi batate ki email galat hai ya password
    }

    // 2. Password match karein (bcrypt check karega ki input password aur db ka hashed password same hain ya nahi)
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // 3. JWT Token banayein
    const payload = {
      userId: user.id,
      role: user.role,
    };
    
    // .env se secret nikalein (agar na mile toh fallback use karein, halanki prod mein fallback nahi hona chahiye)
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1d' });

    // 4. User data (bina password ke) aur token wapas bhejein
    const { passwordHash, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token
    };
  }

  async changePassword(userId: string, data: any) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(data.oldPassword, user.passwordHash);
    if (!isMatch) throw new Error("Incorrect old password");

    const newPasswordHash = await bcrypt.hash(data.newPassword, 10);
    // Yahan hum update function assume kar rahe hain. 
    await userRepository.update(userId, { passwordHash: newPasswordHash });
    
    return { message: "Password updated successfully" };
  }

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Security: Hum user ko nahi batate ki email galat hai ya sahi
      return { message: "If that email is registered, we have sent a reset link." };
    }

    // Ek temporary token banate hain reset ke liye (15 mins valid)
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
    const resetToken = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '15m' });

    // TODO: RabbitMQ ke zariye Email bhejne ka logic yahan aayega
    // Abhi testing ke liye hum token response mein bhej rahe hain
    return { 
      message: "If that email is registered, we have sent a reset link.",
      resetToken // Note: Production mein ise response mein nahi bhejte!
    };
  }

  async resetPassword(data: any) {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(data.token, jwtSecret) as any;
      
      const newPasswordHash = await bcrypt.hash(data.newPassword, 10);
      await userRepository.update(decoded.userId, { passwordHash: newPasswordHash });
      
      return { message: "Password has been reset successfully" };
    } catch (error) {
      throw new Error("Invalid or expired reset token");
    }
  }

  async refreshToken(oldToken: string) {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
      // Token verify karke user ki details nikali
      const decoded = jwt.verify(oldToken, jwtSecret) as any;
      
      // Naya Token generate kiya
      const newToken = jwt.sign({ userId: decoded.userId, role: decoded.role }, jwtSecret, { expiresIn: '1d' });
      return { token: newToken };
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  async verifyEmail(token: string) {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
      
      // Token verify karke user ID nikalenge
      const decoded = jwt.verify(token, jwtSecret) as { userId: string };
      
      // User ka isActive status true kar denge
      await userRepository.update(decoded.userId, { isActive: true });
      
      return { message: "Email verified successfully. Your account is now active." };
    } catch (error) {
      throw new AppError(400, "Invalid or expired verification token");
    }
  }

}

export const authService = new AuthService();