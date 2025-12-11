import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
}

export const errorMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  console.error(`[Error] Status: ${status}, Message: ${message}`);
  res.status(status).json({ success: false, error: message });
};

export const notFoundMiddleware = (req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
};

export default {
  errorMiddleware,
  notFoundMiddleware,
};
