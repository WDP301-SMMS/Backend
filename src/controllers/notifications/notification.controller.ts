import { NextFunction, Request, Response } from 'express';

import { IUser } from '@/interfaces/user.interface';
import { NotificationService } from '@/services/notifications/notification.service';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export class NotificationController {
  public notificationService = new NotificationService();

  public getNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!._id!.toString();

      const notifications =
        await this.notificationService.getNotificationsForUser(userId);
      res.status(200).json({
        data: notifications,
        message: 'Notifications retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getAttentionNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!._id!.toString();
      const notifications =
        await this.notificationService.getAttentionNotifications(userId);
      res.status(200).json({
        data: notifications,
        message: 'Important notifications retrieved',
      });
    } catch (error) {
      next(error);
    }
  };

  public getUnreadCount = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!._id!.toString();
      const count = await this.notificationService.getUnreadCount(userId);
      res
        .status(200)
        .json({ data: { count }, message: 'Unread count retrieved' });
    } catch (error) {
      next(error);
    }
  };

  public markAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!._id!.toString();
      const { notificationId } = req.params;
      await this.notificationService.markAsRead(notificationId, userId);
      res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
      next(error);
    }
  };

  public markAllAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!._id!.toString();
      await this.notificationService.markAllAsRead(userId);
      res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  };
}
