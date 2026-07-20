// apps/auth-service/src/routes/auth.routes.ts

import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

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
router.post('/verify-email', authController.verifyEmail);

export default router;