import prisma from '../../config/db';
import BaseRepository from '../../core/BaseRepository';
import { IConsent } from '../../core/types';

export class ConsentRepository extends BaseRepository<IConsent> {
  constructor() {
    super(prisma.consent);
  }

  async findByMarketer(marketerId: string) {
    return prisma.consent.findMany({
      where: { marketerId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default ConsentRepository;
