import BaseService from '../../core/BaseService';
import { ILeadType } from '../../core/types';
import LeadTypeRepository from './leadType.repository';

export class LeadTypeService extends BaseService<ILeadType> {
  private leadTypeRepository: LeadTypeRepository;

  constructor() {
    const repository = new LeadTypeRepository();
    super(repository);
    this.leadTypeRepository = repository;
  }

  async createLeadType(data: {
    companyId: string;
    title: string;
    description?: string;
    basePrice: number;
  }) {
    return this.create(data);
  }

  async getLeadTypesByCompany(companyId: string) {
    return this.leadTypeRepository.findByCompanyId(companyId);
  }

  async updateLeadType(
    id: string,
    data: {
      title?: string;
      description?: string;
      basePrice?: number;
    },
  ) {
    return this.update(id, data);
  }
}

export default LeadTypeService;
