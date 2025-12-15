import prisma from '../../config/db';
import { Decimal } from '@prisma/client/runtime/library';
import PayoutRepository from './payout.repository';

export class PayoutService {
  private payoutRepository: PayoutRepository;

  constructor() {
    this.payoutRepository = new PayoutRepository();
  }

  async requestPayout(userId: string, amount: number) {
    console.log(`[PAYOUT-REQ] START: userId=${userId}, amount=${amount}`);
    
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
  
    // ⛔ NEW: prevent multiple pending payouts
    const existingPending = await prisma.payout.findFirst({
      where: { userId, status: 'PENDING' }
    });
  
    if (existingPending) {
      console.log(`[PAYOUT-REQ] User already has pending payout: ${existingPending.id}`);
      throw new Error('You already have a pending payout request');
    }
  
    // Check user balance
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
  
    const userBalance =
      typeof user.balance === 'object'
        ? user.balance.toNumber()
        : Number(user.balance);
  
    if (userBalance < amount) {
      throw new Error('Insufficient balance');
    }
  
    console.log(`[PAYOUT-REQ] Creating payout...`);
    
    const payout = await prisma.payout.create({
      data: {
        userId,
        amount: new Decimal(amount),
        status: 'PENDING',
      },
    });
  
    console.log(`[PAYOUT-REQ] Payout created: id=${payout.id}`);
    return payout;
  }
  

  async getUserPayouts(userId: string) {
    return this.payoutRepository.findByUser(userId);
  }

  async getPayoutById(id: string) {
    return this.payoutRepository.findById(id);
  }

  async approvePayout(payoutId: string, adminId: string) {
    return prisma.$transaction(async (tx) => {
      const payout = await tx.payout.findUnique({ where: { id: payoutId } });
      if (!payout) {
        throw new Error('Payout not found');
      }
      if (payout.status !== 'PENDING') {
        throw new Error(`Cannot approve payout with status ${payout.status}`);
      }

      const user = await tx.user.findUnique({ where: { id: payout.userId } });
      if (!user) {
        throw new Error('User not found');
      }

      const currentBalance =
        typeof user.balance === 'object' ? user.balance.toNumber() : Number(user.balance);
      const payoutAmount =
        typeof payout.amount === 'object' ? payout.amount.toNumber() : Number(payout.amount);

      if (currentBalance < payoutAmount) {
        throw new Error('Insufficient balance for payout');
      }

      await tx.user.update({
        where: { id: payout.userId },
        data: { balance: new Decimal(currentBalance - payoutAmount) },
      });

      return tx.payout.update({
        where: { id: payoutId },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: adminId,
        },
      });
    });
  }

  async rejectPayout(payoutId: string, adminId: string, reason: string) {
    const payout = await prisma.payout.findUnique({ where: { id: payoutId } });
    if (!payout) {
      throw new Error('Payout not found');
    }
    if (payout.status !== 'PENDING') {
      throw new Error(`Cannot reject payout with status ${payout.status}`);
    }

    return prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectedBy: adminId,
        rejectionReason: reason,
      },
    });
  }

  async completePayout(payoutId: string) {
    return prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: 'COMPLETED',
      },
    });
  }
  async getAllPayouts(filters: {
  status?: string;
  userId?: string;
  limit: number;
  offset: number;
}) {
  const { status, userId, limit, offset } = filters;

  return prisma.payout.findMany({
    where: {
      ...(status && { status: status as any }),
      ...(userId && { userId }),
    },
    include: {
      user: true,
      approver: true,
      rejector: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

}

export default PayoutService;
