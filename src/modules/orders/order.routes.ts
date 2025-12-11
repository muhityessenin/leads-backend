import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import orderController from './order.controller';

console.log("🔥 order.routes.ts LOADED"); // ← добавили

const router = Router();

router.get('/my', authMiddleware, (req, res) => orderController.getMyOrders(req, res));
router.get('/id/:id', authMiddleware, (req, res) => orderController.getOrder(req, res));
router.post('/lead/:leadId', authMiddleware, (req, res) => orderController.createOrder(req, res));

export default router;
