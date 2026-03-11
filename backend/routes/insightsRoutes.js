import { Router } from 'express';
import * as ctrl from '../controllers/insightsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', ctrl.list);

export default router;
