import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { JwtPayload } from '../core/types';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Missing or invalid authorization header' });
    }
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Authentication error' });
  }
};

export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (decoded) req.user = decoded;
    }
    next();
  } catch (err) {
    next();
  }
};

export default { authMiddleware, optionalAuthMiddleware };
