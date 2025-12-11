import { Request, Response } from 'express';
import AuthService from './auth.service';

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.register(email, password);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}

export default new AuthController();
