import { Router } from 'express';
import * as ctrl from '../controllers/profileController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

// Frontend calls GET /api/profile/me — serve the same as GET /api/profile
router.get('/', ctrl.getProfile);
router.get('/me', ctrl.getProfile);
router.put('/', ctrl.updateProfile);

export default router;
