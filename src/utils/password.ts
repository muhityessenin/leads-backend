import bcrypt from 'bcryptjs';
import env from '../config/env';

export const hash = async (password: string): Promise<string> => {
  const rounds = env.bcryptRounds || 10;
  return bcrypt.hash(password, rounds);
};

export const compare = async (password: string, hashStr: string): Promise<boolean> => {
  return bcrypt.compare(password, hashStr);
};

export const validatePasswordStrength = (password: string): boolean => {
  if (password.length < 8) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

export default { hash, compare, validatePasswordStrength };
