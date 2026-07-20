import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// TypeScript ko batane ke liye ki 'req' ke andar 'user' object bhi ho sakta hai
export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Postman/Frontend headers mein token bhejta hai: "Bearer token_string_here"
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]; // "Bearer " ko hata kar sirf token nikala
    
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';

    // Token verify karna
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        res.status(403).json({ success: false, message: "Invalid or Expired Token" });
        return;
      }
      
      // Token sahi hai toh user data request mein daal do aur aage badhne do (next)
      req.user = decoded;
      next();
    });
  } else {
    // Agar token bheja hi nahi
    res.status(401).json({ success: false, message: "Authorization token required" });
  }
};