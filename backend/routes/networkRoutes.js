import { Router } from 'express';
import * as ctrl from '../controllers/networkController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', ctrl.list);
router.get('/suggestions', ctrl.suggestions);
router.post('/follow/:id', ctrl.follow);
router.post('/unfollow/:id', ctrl.unfollow);
router.post('/connect', ctrl.connect);
router.put('/accept', ctrl.accept);

export default router;
