import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import ConsentService from './consent.service';

const consentService = new ConsentService();

export class ConsentController {
  async getConsents(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

  const consents = await consentService.getConsentsByMarketer(req.user.userId);

      return res.status(200).json({
        success: true,
        data: consents,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get consents',
      });
    }
  }

  async getConsent(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { id } = req.params;

      const consent = await consentService.getById(id);

  if (!consent || consent.marketerId !== req.user.userId) {
        return res.status(404).json({
          success: false,
          error: 'Consent not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: consent,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get consent',
      });
    }
  }
}

export default new ConsentController();
