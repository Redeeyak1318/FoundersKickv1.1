import { Router } from 'express';
import * as ctrl from '../controllers/messagesController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', ctrl.send);
router.get('/:userId', ctrl.getThread);

export default router;
