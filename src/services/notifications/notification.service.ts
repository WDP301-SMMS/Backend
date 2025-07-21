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
    return NotificationModel.find({
      recipientId: userId,
      type: { $ne: 'CHAT_MESSAGE_NEW' },
    })
      .sort({ createdAt: -1 })
      .populate('recipientId', 'username email')
      .lean();
  }

  private attentionTypes = [
    'HEALTH_CHECK_CAMPAIGN_NEW',
    'HEALTH_CHECK_RESULT_READY',
    'VACCINE_CAMPAIGN_NEW',
    'MEDICATION_REQUEST_SCHEDULED',
    'MEDICATION_REQUEST_COMPLETED',
    'MEDICATION_REQUEST_REJECTED',
    'MEETING_SCHEDULE_NEW',
    'MEETING_SCHEDULE_UPDATED',
    'MEETING_SCHEDULE_CANCELED',
    'MEDICAL_INCIDENT_PARENT_ALERT',
  ];

  public async getAttentionNotifications(
    userId: string,
  ): Promise<INotification[]> {
    const daysAgo = 3;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysAgo);

    return NotificationModel.find({
      recipientId: userId,
      type: { $in: this.attentionTypes },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
  }

  public async getUnreadCount(userId: string): Promise<number> {
    return NotificationModel.countDocuments({
      recipientId: userId,
      isRead: false,
      type: { $ne: 'CHAT_MESSAGE_NEW' },
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
