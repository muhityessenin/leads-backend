import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import LeadTypeService from './leadType.service';

const leadTypeService = new LeadTypeService();

export class LeadTypeController {
  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { title, description, basePrice } = req.body;

      if (!title || !basePrice) {
        return res.status(400).json({
          success: false,
          error: 'Title and basePrice are required',
        });
      }

      const leadType = await leadTypeService.createLeadType({
  companyId: req.user.userId,
        title,
        description,
        basePrice: Number(basePrice),
      });

      return res.status(201).json({
        success: true,
        data: leadType,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to create lead type',
      });
    }
  }

  async getMyLeadTypes(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

  const leadTypes = await leadTypeService.getLeadTypesByCompany(req.user.userId);

      return res.status(200).json({
        success: true,
        data: leadTypes,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get lead types',
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        leadTypeService.getMany(undefined, skip, limit),
        leadTypeService.getTotal(),
      ]);

      return res.status(200).json({
        success: true,
        data: items,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get lead types',
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const leadType = await leadTypeService.getById(id);

      if (!leadType) {
        return res.status(404).json({
          success: false,
          error: 'Lead type not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: leadType,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get lead type',
      });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { id } = req.params;
      const { title, description, basePrice } = req.body;

      const leadType = await leadTypeService.getById(id);

  if (!leadType || leadType.companyId !== req.user.userId) {
        return res.status(404).json({
          success: false,
          error: 'Lead type not found',
        });
      }

      const updated = await leadTypeService.updateLeadType(id, {
        title,
        description,
        basePrice: basePrice ? Number(basePrice) : undefined,
      });

      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to update lead type',
      });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { id } = req.params;

      const leadType = await leadTypeService.getById(id);

  if (!leadType || leadType.companyId !== req.user.userId) {
        return res.status(404).json({
          success: false,
          error: 'Lead type not found',
        });
      }

      await leadTypeService.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Lead type deleted',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete lead type',
      });
    }
  }
}

export default new LeadTypeController();
