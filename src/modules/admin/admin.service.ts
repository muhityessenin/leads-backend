import prisma from '../../config/db';
import { hash } from '../../utils/password';

class AdminService {
  async createMarketer(email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('Email already exists');
    const passwordHash = await hash(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'MARKETER',
      },
    });
    return user;
  }
}

export default new AdminService();
