import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import topupController from './topup.controller';

const router = Router();

router.post('/', authMiddleware, (req, res) => topupController.requestTopup(req, res));
router.get('/', authMiddleware, (req, res) => topupController.getMyTopups(req, res));
router.get('/:id', authMiddleware, (req, res) => topupController.getTopup(req, res));

export default router;

