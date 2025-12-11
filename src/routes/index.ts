import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/users/user.routes';
import leadTypeRoutes from '../modules/leadTypes/leadType.routes';
import leadRoutes from '../modules/leads/lead.routes';
import orderRoutes from '../modules/orders/order.routes';
import paymentRoutes from '../modules/payments/payment.routes';
import consentRoutes from '../modules/consent/consent.routes';
import adminRoutes from '../modules/admin/admin.routes';
import payoutRoutes from '../modules/payouts/payout.routes';
import topupRoutes from '../modules/topups/topup.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/lead-types', leadTypeRoutes);
router.use('/leads', leadRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/consent', consentRoutes);
router.use('/payouts', payoutRoutes);
router.use('/topups', topupRoutes);
router.use('/admin', adminRoutes);

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
