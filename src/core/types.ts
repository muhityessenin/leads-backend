// Core shared types

export type UserRole = 'MARKETER' | 'MANAGER' | 'ADMIN';

export interface JwtPayload {
  userId: string;
  role?: UserRole;
}

export interface IUser {
  id: string;
  email: string;
  passwordHash?: string;
  role?: UserRole;
  balance?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ILeadType {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  basePrice?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILeadPublic {
  id: string;
  leadTypeId: string;
  marketerId: string;
  city: string;
  price: number;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILeadPrivate {
  id: string;
  phone: string;
  fullName: string;
  consentId: string;
}

export interface IConsent {
  id: string;
  marketerId: string;
  consentText: string;
  clientIp?: string;
  userAgent?: string;
}

export interface IOrder {
  id: string;
  leadId: string;
  managerId?: string;
  amount?: number;
  status?: string;
}

export interface IPayment {
  id: string;
  orderId: string;
  externalId?: string;
  amount?: number;
  status?: string;
}

export interface IAuditLog {
  id: string;
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
}
