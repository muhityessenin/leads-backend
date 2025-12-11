import { v4 as uuidv4 } from 'uuid';
import BaseService from '../../core/BaseService';
import { IPayment } from '../../core/types';
import PaymentRepository from './payment.repository';
import prisma from '../../config/db';

import OrderService from '../orders/order.service';
import userService from '../users/user.service';
import AuditService from '../audit/audit.service';

const orderService = new OrderService();
const auditService = new AuditService();

export class PaymentService extends BaseService<IPayment> {
  private paymentRepository: PaymentRepository;

  constructor() {
    const repository = new PaymentRepository();
    super(repository);
    this.paymentRepository = repository;
  }

  async createPayment(orderId: string) {
    const order = await orderService.getById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Generate fake external ID
    const externalId = `payment_${uuidv4().substring(0, 8)}`;

    const payment = await this.create({
      orderId,
      externalId,
      amount: order.amount,
      status: 'CREATED',
    });

    return {
      ...payment,
      payment_url: `https://payment.example.com/pay/${externalId}`,
    };
  }

  async processPaymentWebhook(externalId: string, status: string) {
    const payment = await this.paymentRepository.findByExternalId(externalId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (status === 'paid' || status === 'success') {
      // Update payment status
      const updatedPayment = await this.update(payment.id, {
        status: 'PAID',
        paidAt: new Date(),
      });

      // Update order status
      const order = await orderService.getById(payment.orderId);
      if (order) {
        await orderService.updateOrderStatus(payment.orderId, 'SUCCESS');

        // Update user balance
        const lead = await prisma.leadPublic.findUnique({
          where: { id: order.leadId },
          include: { leadType: true },
        });

        if (lead) {
          await userService.updateUserBalance(lead.marketerId, Number(order.amount));

          // Log audit (if manager exists)
          if (order.managerId) {
            await auditService.logAction({
              userId: order.managerId,
              action: 'PURCHASE_LEAD',
              entity: 'order',
              entityId: order.id,
              metadata: { leadId: order.leadId, amount: order.amount },
            });
          }

          // Log audit for marketer
          await auditService.logAction({
            userId: lead.marketerId,
            action: 'LEAD_SOLD',
            entity: 'lead',
            entityId: lead.id,
            metadata: { orderId: order.id, amount: order.amount },
          });
        }
      }

      return updatedPayment;
    } else if (status === 'failed' || status === 'failure') {
      return this.update(payment.id, { status: 'FAILED' });
    }

    return payment;
  }

  async getPaymentsByOrder(orderId: string) {
    return this.paymentRepository.findByOrder(orderId);
  }

  async refundPayment(id: string) {
    const payment = await this.getById(id);

    if (!payment || payment.status !== 'PAID') {
      throw new Error('Invalid payment for refund');
    }

    // Reverse balance update
    const order = await orderService.getById(payment.orderId);
    if (order) {
      const lead = await prisma.leadPublic.findUnique({
        where: { id: order.leadId },
      });

      if (lead) {
        await userService.updateUserBalance(lead.marketerId, -Number(order.amount));
      }
    }

    return this.update(id, { status: 'REFUNDED' });
  }
}

export default PaymentService;
