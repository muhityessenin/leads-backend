import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { validatePhoneNumber, validatePaginationParams } from '../../utils/validation';
import LeadService from './lead.service';
import AuditService from '../audit/audit.service';

const leadService = new LeadService();
const auditService = new AuditService();

export class LeadController {
  async createLead(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const {
        leadTypeId,
        city,
        price,
        phone,
        fullName,
        consentText,
        clientIp,
        userAgent,
      } = req.body;

      if (!leadTypeId || !price || !phone || !consentText) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
        });
      }


      if (!validatePhoneNumber(phone)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid phone number',
        });
      }

      const lead = await leadService.createLead({
        leadTypeId,
  marketerId: req.user.userId,
        city,
        price: Number(price),
        phone,
        fullName,
        consentText,
        clientIp: clientIp || req.ip || 'unknown',
        userAgent: userAgent || req.get('user-agent') || 'unknown',
      });

      // Log to audit
      await auditService.logAction({
  userId: req.user.userId,
        action: 'CREATE_LEAD',
        entity: 'lead',
        entityId: lead.id,
        metadata: { leadTypeId, city },
      });

      return res.status(201).json({
        success: true,
        data: lead,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to create lead',
      });
    }
  }

  async getMyLeads(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

  const leads = await leadService.getLeadsByMarketer(req.user.userId);

      return res.status(200).json({
        success: true,
        data: leads,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get leads',
      });
    }
  }

  async getCatalog(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { page: validPage, limit: validLimit } = validatePaginationParams(
        page,
        limit,
      );

      const result = await leadService.getPublishedLeads(validPage, validLimit);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get catalog',
      });
    }
  }

  async getLeadFullInfo(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { id } = req.params;

      const lead = await leadService.getLeadFullInfo(id);

      // Check if manager bought this lead
      const order = await (
        await import('../../config/db')
      ).default.order.findFirst({
        where: {
          leadId: id,
          managerId: req.user.userId,
          status: 'SUCCESS',
        },
      });

  if (!order && lead.marketerId !== req.user.userId) {
        // Hide private info if not bought and not owner
        return res.status(200).json({
          success: true,
          data: {
            ...lead,
            leadPrivate: null,
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get lead',
      });
    }
  }

  async searchLeads(req: Request, res: Response) {
    try {
      const { city } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!city) {
        return res.status(400).json({
          success: false,
          error: 'City parameter is required',
        });
      }

      const { page: validPage, limit: validLimit } = validatePaginationParams(
        page,
        limit,
      );

      const result = await leadService.searchLeadsByCity(
        city as string,
        validPage,
        validLimit,
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to search leads',
      });
    }
  }

  async publishLead(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { id } = req.params;

  const lead = await leadService.publishLead(id, req.user.userId);

      return res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to publish lead',
      });
    }
  }
}

export default new LeadController();
