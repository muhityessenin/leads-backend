import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import TopupService from './topup.service';
import AuditService from '../audit/audit.service';

const topupService = new TopupService();
const auditService = new AuditService();

export class TopupController {
  async requestTopup(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, error: 'Invalid amount' });
      }

      const topup = await topupService.requestTopup(req.user.userId, Number(amount));

      await auditService.logAction({
        userId: req.user.userId,
        action: 'REQUEST_TOPUP',
        entity: 'topup',
        entityId: topup.id,
        metadata: { amount },
      });

      return res.status(201).json({ success: true, data: topup });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async getMyTopups(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const topups = await topupService.getUserTopups(req.user.userId);
      return res.status(200).json({ success: true, data: topups });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getTopup(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { id } = req.params;
      const topup = await topupService.getTopupById(id);

      if (!topup) {
        return res.status(404).json({ success: false, error: 'Topup not found' });
      }

      if (topup.userId !== req.user.userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }

      return res.status(200).json({ success: true, data: topup });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

export default new TopupController();

