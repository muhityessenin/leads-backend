import prisma from '../../config/db';
import BaseRepository from '../../core/BaseRepository';
import { IUser } from '../../core/types';

export default class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(prisma.user);
  }

  async findByEmail(email: string) {
    return this.model.findUnique({ where: { email } });
  }

  async findByRole(role: string) {
    return this.model.findMany({ where: { role } });
  }
}
