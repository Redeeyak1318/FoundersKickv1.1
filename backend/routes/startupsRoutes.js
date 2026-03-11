import { Router } from 'express';
import * as ctrl from '../controllers/startupsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Public read
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);

// Protected write
router.post('/', authMiddleware, ctrl.create);
router.put('/:id', authMiddleware, ctrl.update);
router.delete('/:id', authMiddleware, ctrl.remove);

export default router;
