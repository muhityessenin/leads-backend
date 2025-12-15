import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import adminController from './admin.controller';

const router = Router();

// Only ADMIN role can create marketer users via this endpoint
router.post('/users', authMiddleware, (req, res) => adminController.createMarketer(req, res));

// Admin: update lead status (NEW | PUBLISHED | SOLD)
router.put('/leads/:id/status', authMiddleware, (req, res) => adminController.updateLeadStatus(req, res));

// ADMIN: view payouts
router.get('/payouts', authMiddleware, (req, res) =>
  adminController.getAllPayouts(req, res)
);
router.get('/payouts/:id', authMiddleware, (req, res) =>
  adminController.getPayoutById(req, res)
);

// ADMIN: view topups
router.get('/topups', authMiddleware, (req, res) =>
  adminController.getAllTopups(req, res)
);
router.get('/topups/:id', authMiddleware, (req, res) =>
  adminController.getTopupById(req, res)
);


// Admin: approve/reject payouts
router.put('/payouts/:id/approve', authMiddleware, (req, res) => adminController.approvePayout(req, res));
router.put('/payouts/:id/reject', authMiddleware, (req, res) => adminController.rejectPayout(req, res));

// Admin: approve/reject topups
router.put('/topups/:id/approve', authMiddleware, (req, res) => adminController.approveTopup(req, res));
router.put('/topups/:id/reject', authMiddleware, (req, res) => adminController.rejectTopup(req, res));

export default router;
