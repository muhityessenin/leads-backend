import prisma from '../../config/db';
import { hash, compare } from '../../utils/password';
import { generateToken } from '../../utils/jwt';

class AuthService {
  async register(email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('Email already exists');
    const passwordHash = await hash(password);
  const user = await prisma.user.create({ data: { email, passwordHash, role: 'MANAGER' } });
    const token = generateToken({ userId: user.id, role: user.role });
    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');
    const ok = await compare(password, user.passwordHash || '');
    if (!ok) throw new Error('Invalid credentials');
    const token = generateToken({ userId: user.id, role: user.role });
    return { user, token };
  }
}
export default new AuthService();
