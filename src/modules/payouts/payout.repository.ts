import prisma from '../../config/db';

export class PayoutRepository {
  async findByUser(userId: string) {
    return prisma.payout.findMany({
      where: { userId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.payout.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async create(data: any) {
    return prisma.payout.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.payout.update({
      where: { id },
      data,
    });
  }
}

export default PayoutRepository;
