

import { Decimal } from '@prisma/client/runtime/library';
import BaseService from '../../core/BaseService';
import { IOrder } from '../../core/types';
import OrderRepository from './order.repository';
import prisma from '../../config/db';

export class OrderService extends BaseService<IOrder> {
  private orderRepository: OrderRepository;

  constructor() {
    const repository = new OrderRepository();
    super(repository);
    this.orderRepository = repository;
  }
  async createOrder(data: { leadId: string; managerId: string }) {
    // Fetch lead and ensure it is available for purchase
    const lead = await prisma.leadPublic.findUnique({
      where: { id: data.leadId },
    });

    if (!lead || lead.status !== 'PUBLISHED') {
      throw new Error('Lead not available');
    }

    // Determine the price from the lead itself to avoid tampering from the client
    const leadPrice =
      typeof lead.price === 'object' ? lead.price.toNumber() : Number(lead.price);

    // Load manager balance to ensure funds are sufficient
    const manager = await prisma.user.findUnique({
      where: { id: data.managerId },
      select: { balance: true },
    });

    if (!manager) {
      throw new Error('Manager not found');
    }

    const managerBalance =
      typeof manager.balance === 'object'
        ? manager.balance.toNumber()
        : Number(manager.balance);

    if (managerBalance < leadPrice) {
      throw new Error('Insufficient balance');
    }

    // Atomically validate exclusivity, create the order, move balances, mark lead as sold and store payment record
    const orderWithRelations = await prisma.$transaction(async (tx) => {
      // Re-read lead inside the transaction to avoid race
      const freshLead = await tx.leadPublic.findUnique({
        where: { id: data.leadId },
      });

      if (!freshLead || freshLead.status !== 'PUBLISHED') {
        throw new Error('Lead not available');
      }

      // Only one manager overall can buy the lead, only once
      const anySuccessful = await tx.order.findFirst({
        where: {
          leadId: data.leadId,
          status: 'SUCCESS',
        },
      });
      if (anySuccessful) {
        throw new Error('Lead already purchased');
      }

      // Prevent the same manager from creating duplicate orders even if pending/cancelled
      const anyByManager = await tx.order.findFirst({
        where: {
          leadId: data.leadId,
          managerId: data.managerId,
        },
      });
      if (anyByManager) {
        throw new Error('Lead already requested by this manager');
      }

      const marketer = await tx.user.findUnique({
        where: { id: freshLead.marketerId },
        select: { balance: true },
      });

      if (!marketer) {
        throw new Error('Lead owner not found');
      }

      const marketerBalance =
        typeof marketer.balance === 'object'
          ? marketer.balance.toNumber()
          : Number(marketer.balance);

      const createdOrder = await tx.order.create({
        data: {
          leadId: data.leadId,
          managerId: data.managerId,
          amount: new Decimal(leadPrice),
          status: 'SUCCESS',
        },
      });

      await tx.leadPublic.update({
        where: { id: data.leadId },
        data: { status: 'SOLD' },
      });

      await tx.user.update({
        where: { id: data.managerId },
        data: { balance: new Decimal(managerBalance - leadPrice) },
      });

      await tx.user.update({
        where: { id: freshLead.marketerId },
        data: { balance: new Decimal(marketerBalance + leadPrice) },
      });

      await tx.payment.create({
        data: {
          orderId: createdOrder.id,
          amount: new Decimal(leadPrice),
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      return tx.order.findUnique({
        where: { id: createdOrder.id },
        include: {
          lead: { include: { leadPrivate: true } },
          payments: true,
        },
      });
    });

    return orderWithRelations!;
  }

  async getOrdersByManager(managerId: string) {
    const orders = await this.orderRepository.findByManager(managerId);

    const grouped = orders.reduce((acc: any, order) => {
      const leadType = order.lead.leadType;

      const leadTypeId = leadType.id;

      if (!acc[leadTypeId]) {
        acc[leadTypeId] = {
          leadType: {
            id: leadType.id,
            title: leadType.title,
            description: leadType.description,
            basePrice: leadType.basePrice,
          },
          orders: [],
        };
      }

      acc[leadTypeId].orders.push(order);

      return acc;
    }, {});

    return Object.values(grouped);
  }


  async getOrderForManager(orderId: string, managerId: string) {
    return this.orderRepository.findForManagerById(orderId, managerId);
  }

  async updateOrderStatus(id: string, status: 'SUCCESS' | 'CANCELLED') {
    const order = await this.getById(id);

    if (!order) {
      throw new Error('Order not found');
    }

    const updated = await this.update(id, { status });

    if (status === 'SUCCESS') {
      // Mark lead as sold
      await prisma.leadPublic.update({
        where: { id: order.leadId },
        data: { status: 'SOLD' },
      });
    }

    return updated;
  }

  async cancelOrder(id: string) {
    return this.updateOrderStatus(id, 'CANCELLED');
  }
}

export default OrderService;
