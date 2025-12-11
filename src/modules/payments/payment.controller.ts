import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import PaymentService from './payment.service';

const paymentService = new PaymentService();

export class PaymentController {
  async createPayment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { orderId } = req.params;

      const payment = await paymentService.createPayment(orderId);

      return res.status(201).json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Failed to create payment',
      });
    }
  }

  async getPayments(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { orderId } = req.params;

      const payments = await paymentService.getPaymentsByOrder(orderId);

      return res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get payments',
      });
    }
  }

  async refund(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { id } = req.params;

      const payment = await paymentService.refundPayment(id);

      return res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Failed to refund payment',
      });
    }
  }
}

export default new PaymentController();
