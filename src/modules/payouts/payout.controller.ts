import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import PayoutService from './payout.service';
import AuditService from '../audit/audit.service';

const payoutService = new PayoutService();
const auditService = new AuditService();

export class PayoutController {
  async requestPayout(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, error: 'Invalid amount' });
      }

      const payout = await payoutService.requestPayout(req.user.userId, Number(amount));

      await auditService.logAction({
        userId: req.user.userId,
        action: 'REQUEST_PAYOUT',
        entity: 'payout',
        entityId: payout.id,
        metadata: { amount },
      });

      return res.status(201).json({ success: true, data: payout });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async getMyPayouts(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const payouts = await payoutService.getUserPayouts(req.user.userId);
      return res.status(200).json({ success: true, data: payouts });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getPayout(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { id } = req.params;
      const payout = await payoutService.getPayoutById(id);

      if (!payout) {
        return res.status(404).json({ success: false, error: 'Payout not found' });
      }

      // Check authorization (owner or admin)
      if (payout.userId !== req.user.userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }

      return res.status(200).json({ success: true, data: payout });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

export default new PayoutController();
