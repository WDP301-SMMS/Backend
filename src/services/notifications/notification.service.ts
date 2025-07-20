import { INotification } from '@/interfaces/notifications.interface';
import { NotificationModel } from '@/models/notifications.model';

type CreateNotificationPayload = Omit<INotification, 'isRead' | 'createdAt'>;

export class NotificationService {
  public async createNotifications(
    payloads: CreateNotificationPayload[],
  ): Promise<void> {
    if (!payloads || payloads.length === 0) {
      return;
    }
    await NotificationModel.insertMany(payloads);
  }

  public async getNotificationsForUser(
    userId: string,
  ): Promise<INotification[]> {
    return NotificationModel.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .populate('recipientId', 'username email')
      .lean();
  }

  public async getUnreadCount(userId: string): Promise<number> {
    return NotificationModel.countDocuments({
      recipientId: userId,
      isRead: false,
    });
  }

  public async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await NotificationModel.updateOne(
      { _id: notificationId, recipientId: userId },
      { $set: { isRead: true } },
    );
    return result.modifiedCount > 0;
  }

  public async markAllAsRead(userId: string): Promise<boolean> {
    const result = await NotificationModel.updateMany(
      { recipientId: userId, isRead: false },
      { $set: { isRead: true } },
    );
    return result.modifiedCount > 0;
  }
}
