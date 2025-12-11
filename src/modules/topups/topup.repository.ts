import prisma from '../../config/db';

export class TopupRepository {
  async findByUser(userId: string) {
    return prisma.balanceTopup.findMany({
      where: { userId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.balanceTopup.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async create(data: any) {
    return prisma.balanceTopup.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.balanceTopup.update({
      where: { id },
      data,
    });
  }
}

export default TopupRepository;

