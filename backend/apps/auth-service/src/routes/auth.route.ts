// apps/auth-service/src/routes/auth.routes.ts

import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';
import { publishEvent } from '../events/publisher.js';

const router = Router();

// POST request ko humare Controller se connect kar rahe hain
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateJWT, authController.getMe);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh', authController.refreshToken);
router.post('/change-password', authenticateJWT, authController.changePassword);
router.post('/logout', authenticateJWT, authController.logout);
router.get('/verify-email', authController.verifyEmail);
router.post(
  "/resend-verification",
  authController.resendVerification
);
router.get("/rabbit-test", async (_req, res) => {
  await publishEvent("test.event", {
    message: "Hello RabbitMQ",
    createdAt: new Date(),
  });

  res.json({
    success: true,
  });
});
export default router;