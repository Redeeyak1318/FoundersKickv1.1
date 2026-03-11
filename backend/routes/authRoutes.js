import { Router } from 'express';
import * as ctrl from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Public — Google OAuth redirect URL
router.get('/google', ctrl.googleOAuth);

// Protected
router.get('/session', authMiddleware, ctrl.getSession);
router.post('/logout', authMiddleware, ctrl.logout);

export default router;
