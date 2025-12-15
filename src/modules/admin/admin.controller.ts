import { Request, Response } from 'express';
import AdminService from './admin.service';
import { AuthRequest } from '../../middleware/authMiddleware';
import LeadService from '../leads/lead.service';
import AuditService from '../audit/audit.service';
import PayoutService from '../payouts/payout.service';
import TopupService from '../topups/topup.service';

const leadService = new LeadService();
const auditService = new AuditService();
const payoutService = new PayoutService();
const topupService = new TopupService();

class AdminController {
  async createMarketer(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }

      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
      }

      const user = await AdminService.createMarketer(email, password);
      return res.status(201).json({ success: true, data: user });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async updateLeadStatus(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!id || !status) {
        return res.status(400).json({ success: false, error: 'id and status are required' });
      }

      // Validate allowed statuses
      const allowed = ['NEW', 'PUBLISHED', 'SOLD'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status value' });
      }

      const updated = await leadService.update(id, { status });

      // Audit log
      await auditService.logAction({
        userId: req.user.userId,
        action: 'ADMIN_UPDATE_LEAD_STATUS',
        entity: 'lead',
        entityId: id,
        metadata: { status },
      });

      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async approvePayout(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }

      const { id } = req.params;
      const payout = await payoutService.approvePayout(id, req.user.userId);

      await auditService.logAction({
        userId: req.user.userId,
        action: 'APPROVE_PAYOUT',
        entity: 'payout',
        entityId: id,
        metadata: { amount: payout.amount },
      });

      return res.status(200).json({ success: true, data: payout });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async rejectPayout(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }

      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ success: false, error: 'Rejection reason is required' });
      }

      const payout = await payoutService.rejectPayout(id, req.user.userId, reason);

      await auditService.logAction({
        userId: req.user.userId,
        action: 'REJECT_PAYOUT',
        entity: 'payout',
        entityId: id,
        metadata: { reason },
      });

      return res.status(200).json({ success: true, data: payout });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async approveTopup(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }

      const { id } = req.params;
      const topup = await topupService.approveTopup(id, req.user.userId);

      await auditService.logAction({
        userId: req.user.userId,
        action: 'APPROVE_TOPUP',
        entity: 'topup',
        entityId: id,
        metadata: { amount: topup.amount },
      });

      return res.status(200).json({ success: true, data: topup });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async rejectTopup(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }

      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ success: false, error: 'Rejection reason is required' });
      }

      const topup = await topupService.rejectTopup(id, req.user.userId, reason);

      await auditService.logAction({
        userId: req.user.userId,
        action: 'REJECT_TOPUP',
        entity: 'topup',
        entityId: id,
        metadata: { reason },
      });

      return res.status(200).json({ success: true, data: topup });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
  // ADMIN: get all payouts
async getAllPayouts(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const { status, userId, limit = 20, offset = 0 } = req.query;

    const payouts = await payoutService.getAllPayouts({
      status: status as string | undefined,
      userId: userId as string | undefined,
      limit: Number(limit),
      offset: Number(offset),
    });

    return res.json({ success: true, data: payouts });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ADMIN: get single payout
async getPayoutById(req: AuthRequest, res: Response) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  const payout = await payoutService.getPayoutById(req.params.id);
  if (!payout) {
    return res.status(404).json({ success: false, error: 'Payout not found' });
  }

  return res.json({ success: true, data: payout });
}

// ADMIN: get all topups
async getAllTopups(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const { status, userId, limit = 20, offset = 0 } = req.query;

    const topups = await topupService.getAllTopups({
      status: status as string | undefined,
      userId: userId as string | undefined,
      limit: Number(limit),
      offset: Number(offset),
    });

    return res.json({ success: true, data: topups });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ADMIN: get single topup
async getTopupById(req: AuthRequest, res: Response) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  const topup = await topupService.getTopupById(req.params.id);
  if (!topup) {
    return res.status(404).json({ success: false, error: 'Topup not found' });
  }

  return res.json({ success: true, data: topup });
}

}

export default new AdminController();
