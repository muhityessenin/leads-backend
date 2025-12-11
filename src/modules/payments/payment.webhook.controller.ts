import { Request, Response } from 'express';
import env from '../../config/env';
import PaymentService from './payment.service';

const paymentService = new PaymentService();

export class PaymentWebhookController {
  async handleWebhook(req: Request, res: Response) {
    try {
      const { external_id, status, signature } = req.body;

      // Verify signature (simplified)
      if (signature !== env.paymentWebhookSecret) {
        return res.status(401).json({
          success: false,
          error: 'Invalid signature',
        });
      }

      if (!external_id || !status) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
        });
      }

      const payment = await paymentService.processPaymentWebhook(
        external_id,
        status,
      );

      return res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Webhook processing failed',
      });
    }
  }
}

export default new PaymentWebhookController();
