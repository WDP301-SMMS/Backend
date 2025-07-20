import redisConnection from '@/config/redis';
import { INotification } from '@/interfaces/notifications.interface';
import { Queue } from 'bullmq';


export const NOTIFICATION_QUEUE_NAME = 'notification-processing';

export const notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: 1000,
  },
});

export type NotificationJobPayload = Omit<INotification, 'isRead' | 'createdAt' | 'recipientId'> & {
  recipientIds: string[];
};

export const addNotificationJob = (data: NotificationJobPayload) => {
  return notificationQueue.add('create-notifications-job', data);
};