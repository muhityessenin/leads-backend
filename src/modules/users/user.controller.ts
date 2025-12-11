import { Request, Response } from 'express';
import userService from './user.service';

class UserController {
  async profile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const user = await userService.getById(userId);
      res.json({ success: true, data: user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export default new UserController();
