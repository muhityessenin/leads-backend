import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import payoutController from './payout.controller';

const router = Router();

// User payout requests
router.post('/', authMiddleware, (req, res) => payoutController.requestPayout(req, res));
router.get('/', authMiddleware, (req, res) => payoutController.getMyPayouts(req, res));
router.get('/:id', authMiddleware, (req, res) => payoutController.getPayout(req, res));

export default router;
