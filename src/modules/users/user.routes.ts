import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import userController from './user.controller';

const router = Router();

router.get('/profile', authMiddleware, (req, res) => userController.profile(req, res));
router.get('/', (req, res) => userController.profile(req, res));

export default router;
