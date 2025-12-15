import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/db';
import BaseService from '../../core/BaseService';
import LeadRepository from './lead.repository';
import { ILeadPublic } from '../../core/types';

export class LeadService extends BaseService<ILeadPublic> {
  private leadRepository: LeadRepository;

  constructor() {
    const repository = new LeadRepository();
    super(repository);
    this.leadRepository = repository;
  }

  async createLead(data: {
    leadTypeId: string;
    marketerId: string;
    city?: string;
    price: number;
    phone: string;
    fullName?: string;
    consentText: string;
    clientIp: string;
    userAgent: string;
  }) {
    const leadId = uuidv4();

    // Create consent
    const consent = await prisma.consent.create({
      data: {
        marketerId: data.marketerId,
        consentText: data.consentText,
        clientIp: data.clientIp,
        userAgent: data.userAgent,
      },
    });

    // Create lead public
    const leadPublic = await prisma.leadPublic.create({
      data: {
        id: leadId,
        leadTypeId: data.leadTypeId,
        marketerId: data.marketerId,
        city: data.city ? data.city : '',
        price: data.price,
        status: 'NEW',
      },
      include: { leadType: true },
    });

    // Create lead private
    const leadPrivate = await prisma.leadPrivate.create({
      data: {
        id: leadId,
        phone: data.phone,
        fullName: data.fullName ? data.fullName : '',
        consentId: consent.id,
      },
    });

    return {
      ...leadPublic,
      leadPrivate,
      consent,
    };
  }

  async getLeadsByMarketer(marketerId: string) {
    return this.leadRepository.findByMarketer(marketerId);
  }

  async getPublishedLeads(page: number = 1, limit: number = 10) {
    const { skip } = this.getPaginationParams(page, limit);
    const leads = await this.leadRepository.findPublishedLeads(skip, limit);
    const total = await this.leadRepository.countPublishedLeads();

    return this.getPaginatedResponse(leads, total, page, limit);
  }

  async searchLeadsByCity(
    city: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const { skip } = this.getPaginationParams(page, limit);
    const leads = await this.leadRepository.findByCity(city, skip, limit);
    const total = await prisma.leadPublic.count({
      where: {
        city: { contains: city, mode: 'insensitive' },
        status: 'PUBLISHED',
      },
    });

    return this.getPaginatedResponse(leads, total, page, limit);
  }

  async publishLead(id: string, marketerId: string) {
    const lead = await this.getById(id);

    if (!lead || lead.marketerId !== marketerId) {
      throw new Error('Lead not found or unauthorized');
    }

    return this.update(id, { status: 'PUBLISHED' });
  }

  async getLeadFullInfo(id: string) {
    const lead = await prisma.leadPublic.findUnique({
      where: { id },
      include: {
        leadType: true,
        leadPrivate: true,
      },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    return lead;
  }

  async sellLead(id: string) {
    return this.update(id, { status: 'SOLD' });
  }
}

export default LeadService;
