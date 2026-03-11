import { Router } from 'express';
import * as ctrl from '../controllers/profileController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', ctrl.getProfile);
router.put('/', ctrl.updateProfile);

export default router;
