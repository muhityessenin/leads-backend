import prisma from '../../config/db';
import { Decimal } from '@prisma/client/runtime/library';
import TopupRepository from './topup.repository';

export class TopupService {
  private topupRepository: TopupRepository;

  constructor() {
    this.topupRepository = new TopupRepository();
  }

  async requestTopup(userId: string, amount: number) {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
  
    // 🚫 Check if user already has a pending topup
    const existingPending = await prisma.balanceTopup.findFirst({
      where: {
        userId,
        status: 'PENDING',
      },
    });
  
    if (existingPending) {
      throw new Error('You already have a pending topup request');
    }
  
    // ✅ Create new topup request
    return prisma.balanceTopup.create({
      data: {
        userId,
        amount: new Decimal(amount),
        status: 'PENDING',
      },
    });
  }
  

  async getUserTopups(userId: string) {
    return this.topupRepository.findByUser(userId);
  }

  async getTopupById(id: string) {
    return this.topupRepository.findById(id);
  }

  async approveTopup(topupId: string, adminId: string) {
    return prisma.$transaction(async (tx) => {
      const topup = await tx.balanceTopup.findUnique({ where: { id: topupId } });
      if (!topup) {
        throw new Error('Topup not found');
      }
      if (topup.status !== 'PENDING') {
        throw new Error(`Cannot approve topup with status ${topup.status}`);
      }

      const user = await tx.user.findUnique({ where: { id: topup.userId } });
      if (!user) {
        throw new Error('User not found');
      }

      const currentBalance =
        typeof user.balance === 'object' ? user.balance.toNumber() : Number(user.balance);
      const topupAmount =
        typeof topup.amount === 'object' ? topup.amount.toNumber() : Number(topup.amount);

      await tx.user.update({
        where: { id: topup.userId },
        data: { balance: new Decimal(currentBalance + topupAmount) },
      });

      return tx.balanceTopup.update({
        where: { id: topupId },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: adminId,
        },
      });
    });
  }

  async rejectTopup(topupId: string, adminId: string, reason: string) {
    const topup = await prisma.balanceTopup.findUnique({ where: { id: topupId } });
    if (!topup) {
      throw new Error('Topup not found');
    }
    if (topup.status !== 'PENDING') {
      throw new Error(`Cannot reject topup with status ${topup.status}`);
    }

    return prisma.balanceTopup.update({
      where: { id: topupId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectedBy: adminId,
        rejectionReason: reason,
      },
    });
  }
}

export default TopupService;

