import prisma from '../../config/db';
import BaseRepository from '../../core/BaseRepository';
import { ILeadType } from '../../core/types';

export class LeadTypeRepository extends BaseRepository<ILeadType> {
  constructor() {
    super(prisma.leadType);
  }

  async findByCompanyId(companyId: string) {
    return prisma.leadType.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default LeadTypeRepository;
