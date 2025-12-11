import prisma from '../../config/db';
import BaseRepository from '../../core/BaseRepository';
import { IPayment } from '../../core/types';

export class PaymentRepository extends BaseRepository<IPayment> {
  constructor() {
    super(prisma.payment);
  }

  async findByOrder(orderId: string) {
    return prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByExternalId(externalId: string) {
    return prisma.payment.findFirst({
      where: { externalId },
    });
  }
}

export default PaymentRepository;
