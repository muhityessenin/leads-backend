

import prisma from '../../config/db';
import BaseRepository from '../../core/BaseRepository';
import { IOrder } from '../../core/types';

export class OrderRepository extends BaseRepository<IOrder> {
  constructor() {
    super(prisma.order);
  }
  async findByManager(managerId: string) {
    return prisma.order.findMany({
      where: { managerId },
      include: {
        lead: {
          include: {
            leadPrivate: true,
            leadType: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }


  async findByLead(leadId: string) {
    return prisma.order.findMany({
      where: { leadId },
      include: { payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findForManagerById(id: string, managerId: string) {
    return prisma.order.findFirst({
      where: { id, managerId },
      include: {
        lead: { include: { leadPrivate: true } },
        payments: true,
      },
    });
  }
}

export default OrderRepository;
