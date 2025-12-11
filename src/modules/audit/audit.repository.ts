import prisma from '../../config/db';
import BaseRepository from '../../core/BaseRepository';
import { IAuditLog } from '../../core/types';

export class AuditRepository extends BaseRepository<IAuditLog> {
  constructor() {
    super(prisma.auditLog);
  }

  async findByUser(userId: string, skip?: number, take?: number) {
    return prisma.auditLog.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEntity(entity: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: { entity, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByAction(action: string, skip?: number, take?: number) {
    return prisma.auditLog.findMany({
      where: { action },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default AuditRepository;
