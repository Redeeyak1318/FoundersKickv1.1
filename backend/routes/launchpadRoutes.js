import { Router } from 'express';
import * as ctrl from '../controllers/launchpadController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', ctrl.submit);
router.get('/', ctrl.list);

export default router;
