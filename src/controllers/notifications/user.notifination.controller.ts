import { NextFunction, Request, Response } from 'express';

import { IUser } from '@/interfaces/user.interface';
import { UserService } from '@/services/notifications/user.notification.service';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export class UserController {
  public userService = new UserService();

  public registerPushToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!._id!.toString();
      const { token } = req.body;
      await this.userService.registerPushToken(userId, token);

      res.status(200).json({ success: true, message: 'Push token registered successfully.' });
    } catch (error) {
      next(error);
    }
  };

  public unregisterPushToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!._id!.toString();
      const { token } = req.body;
      await this.userService.unregisterPushToken(userId, token);

      res.status(200).json({ success: true, message: 'Push token unregistered successfully.' });
    } catch (error) {
      next(error);
    }
  };
}