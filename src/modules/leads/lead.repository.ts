import prisma from '../../config/db';
import BaseRepository from '../../core/BaseRepository';
import { ILeadPublic } from '../../core/types';

export class LeadRepository extends BaseRepository<ILeadPublic> {
  constructor() {
    super(prisma.leadPublic);
  }

  async findByMarketer(marketerId: string) {
    return prisma.leadPublic.findMany({
      where: { marketerId },
      include: { leadType: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPublishedLeads(skip?: number, take?: number) {
    return prisma.leadPublic.findMany({
      where: { status: 'PUBLISHED' },
      include: { leadType: true },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async countPublishedLeads() {
    return prisma.leadPublic.count({
      where: { status: 'PUBLISHED' },
    });
  }

  async findByCity(city: string, skip?: number, take?: number) {
    return prisma.leadPublic.findMany({
      where: {
        city: { contains: city, mode: 'insensitive' },
        status: 'PUBLISHED',
      },
      include: { leadType: true },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default LeadRepository;
