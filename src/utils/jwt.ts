import jwt from 'jsonwebtoken';
import env from '../config/env';
import { JwtPayload } from '../core/types';

export const generateToken = (payload: JwtPayload): string => {
  const options: jwt.SignOptions = { expiresIn: env.jwtExpiry as jwt.SignOptions['expiresIn'], algorithm: 'HS256' };
  return jwt.sign(payload as any, env.jwtSecret as jwt.Secret, options);
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    return decoded;
  } catch (err) {
    return null;
  }
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.decode(token) as JwtPayload | null;
    return decoded;
  } catch (err) {
    return null;
  }
};

export default { generateToken, verifyToken, decodeToken };
