

import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import OrderService from './order.service';

const orderService = new OrderService();

export class OrderController {
  // /orders/:leadId
async createOrder(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { leadId } = req.params; // <-- исправлено

    if (!leadId) {
      return res.status(400).json({
        success: false,
        error: 'Missing leadId',
      });
    }

    const order = await orderService.createOrder({
      leadId,
      managerId: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      data: order,
    });

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to create order',
    });
  }
}


  async getMyOrders(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const orders = await orderService.getOrdersByManager(req.user.userId);

      return res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get orders',
      });
    }
  }

  async getOrder(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const { id } = req.params;

      const order = await orderService.getOrderForManager(id, req.user.userId);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get order',
      });
    }
  }
}

export default new OrderController();
