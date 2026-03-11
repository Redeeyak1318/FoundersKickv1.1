import { Router } from 'express';
import * as ctrl from '../controllers/resourcesController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Resources are protected so only authenticated users can browse
router.use(authMiddleware);

router.get('/', ctrl.list);

export default router;
