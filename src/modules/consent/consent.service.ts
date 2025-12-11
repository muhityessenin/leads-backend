import BaseService from '../../core/BaseService';
import { IConsent } from '../../core/types';
import ConsentRepository from './consent.repository';

export class ConsentService extends BaseService<IConsent> {
  private consentRepository: ConsentRepository;

  constructor() {
    const repository = new ConsentRepository();
    super(repository);
    this.consentRepository = repository;
  }

  async createConsent(data: {
    marketerId: string;
    consentText: string;
    clientIp: string;
    userAgent: string;
  }) {
    return this.create(data);
  }

  async getConsentsByMarketer(marketerId: string) {
    return this.consentRepository.findByMarketer(marketerId);
  }
}

export default ConsentService;
