import BaseService from '../../core/BaseService';
import UserRepository from './user.repository';
import { IUser } from '../../core/types';

const repository = new UserRepository();

class UserService extends BaseService<IUser> {
  constructor() {
    super(repository);
  }

  async getUserByEmail(email: string) {
    return repository.findByEmail(email);
  }

  async getUsersByRole(role: string) {
    return repository.findByRole(role);
  }

  async getUserProfile(id: string) {
    const user = await this.getById(id);
    if (!user) throw new Error('User not found');
    // strip sensitive fields
    // @ts-ignore
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async updateUserBalance(id: string, amount: number) {
    const user = await this.getById(id);
    if (!user) throw new Error('User not found');

    const current = Number((user as any).balance || 0);
    const newBalance = current + amount;

    return this.update(id, { balance: newBalance } as any);
  }
}

export default new UserService();
