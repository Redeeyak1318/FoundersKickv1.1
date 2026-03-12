import { Router } from 'express';
import * as ctrl from '../controllers/postsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.delete('/:id', ctrl.remove);
router.post('/:id/like', ctrl.like);
router.post('/:id/comment', ctrl.comment);

export default router;
