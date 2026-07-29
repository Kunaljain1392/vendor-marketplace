import { transporter } from "../config/mail.js";
import { env } from "../config/env.config.js";

class EmailService {

  async sendVerificationEmail(
    email: string,
    firstName: string,
    token: string
  ): Promise<void> {

    const verificationUrl =
      `${env.APP_URL}/api/auth/verify-email?token=${token}`;

    await transporter.sendMail({
      from: env.EMAIL_USER,

      to: email,

      subject: "Verify your email",

      html: `
        <h2>Welcome ${firstName} 👋</h2>

        <p>
          Welcome to Vendor Marketplace.
        </p>

        <p>
          Please verify your email by clicking the button below.
        </p>

        <a href="${verificationUrl}">
          Verify Email
        </a>

        <p>
          This link expires in 10 minutes.
        </p>

        <p>
            Thankyou 😊❤️
        </p>
      `,
    });
  }
}

export const emailService = new EmailService();