import { v4 as uuidv4 } from 'uuid';
import BaseService from '../../core/BaseService';
import { IAuditLog } from '../../core/types';
import AuditRepository from './audit.repository';

export class AuditService extends BaseService<IAuditLog> {
  private auditRepository: AuditRepository;

  constructor() {
    const repository = new AuditRepository();
    super(repository);
    this.auditRepository = repository;
  }

  async logAction(data: {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    metadata?: Record<string, any>;
  }) {
    try {
      return await this.create({
        ...data,
        id: uuidv4(),
      });
    } catch (error) {
      console.error('Failed to log audit action:', error);
      return null;
    }
  }

  async getAuditByUser(userId: string, page: number = 1, limit: number = 10) {
    const { skip } = this.getPaginationParams(page, limit);
    const logs = await this.auditRepository.findByUser(userId, skip, limit);
    const total = await this.getTotal({ userId });

    return this.getPaginatedResponse(logs, total, page, limit);
  }

  async getAuditByEntity(entity: string, entityId: string) {
    return this.auditRepository.findByEntity(entity, entityId);
  }

  async getAuditByAction(action: string, page: number = 1, limit: number = 10) {
    const { skip } = this.getPaginationParams(page, limit);
    const logs = await this.auditRepository.findByAction(action, skip, limit);
    const total = await this.getTotal({ action });

    return this.getPaginatedResponse(logs, total, page, limit);
  }
}

export default AuditService;
