import { Router } from 'express';
import * as ctrl from '../controllers/networkController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', ctrl.list);
router.post('/connect', ctrl.connect);
router.put('/accept', ctrl.accept);

export default router;
