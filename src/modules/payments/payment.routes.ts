import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import paymentController from './payment.controller';
import paymentWebhookController from './payment.webhook.controller';

const router = Router();

router.post('/create/:orderId', authMiddleware, (req, res) => paymentController.createPayment(req, res));
router.get('/:orderId', authMiddleware, (req, res) => paymentController.getPayments(req, res));
router.post('/refund/:id', authMiddleware, (req, res) => paymentController.refund(req, res));
router.post('/webhook', (req, res) => paymentWebhookController.handleWebhook(req, res));

export default router;
