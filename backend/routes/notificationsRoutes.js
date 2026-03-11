import { Router } from 'express';
import * as ctrl from '../controllers/notificationsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', ctrl.list);
router.put('/read', ctrl.markRead);

export default router;
