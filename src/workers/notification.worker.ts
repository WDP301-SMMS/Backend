import { Worker, Job } from 'bullmq';
import mongoose from 'mongoose';
import redisConnection from '@/config/redis';
import { NOTIFICATION_QUEUE_NAME, NotificationJobPayload } from '@/queues/notification.queue';
import { NotificationType } from '@/enums/NotificationEnums';
import { INotification } from '@/interfaces/notifications.interface';
import { NotificationService } from '@/services/notifications/notification.service';
import { UserModel } from '@/models/user.model';
import { pushNotificationService } from '@/services/notifications/push-notification.service';


const getPushContent = (type: NotificationType, actorName: string): { title: string; body: string } => {
  switch (type) {
    case NotificationType.HEALTH_CHECK_CAMPAIGN_NEW:
      return { title: 'Khám Sức Khỏe', body: 'Nhà trường vừa có một chiến dịch khám sức khỏe mới.' };
    case NotificationType.HEALTH_CHECK_RESULT_READY:
      return { title: 'Kết Quả Sức Khỏe', body: 'Kết quả khám sức khỏe của con bạn đã có.' };
    case NotificationType.VACCINE_CAMPAIGN_NEW:
      return { title: 'Tiêm Chủng', body: 'Nhà trường vừa có một chiến dịch tiêm chủng mới.' };
    case NotificationType.NEW_MEDICATION_REQUEST_RECEIVED:
      return { title: 'Yêu Cầu Cấp Thuốc', body: `${actorName} vừa gửi một yêu cầu cấp thuốc mới.` };
    case NotificationType.CHAT_MESSAGE_NEW:
      return { title: 'Tin Nhắn Mới', body: `${actorName} đã gửi cho bạn một tin nhắn.` };
    default:
      return { title: 'Thông Báo Mới', body: 'Bạn có một thông báo mới từ School Health.' };
  }
};

const processNotificationJob = async (job: Job<NotificationJobPayload>) => {
  console.log(`[Worker] Processing job ${job.id}`);
  const { recipientIds, actorId, type, entityId, entityModel } = job.data;

  if (!recipientIds || recipientIds.length === 0) {
    console.warn(`[Worker] Job ${job.id} has no recipients. Skipping.`);
    return;
  }

  const notificationPayloads: Omit<INotification, 'isRead' | 'createdAt'>[] = recipientIds.map((id: string) => ({
    recipientId: new mongoose.Types.ObjectId(id),
    actorId: new mongoose.Types.ObjectId(actorId),
    type,
    entityId: new mongoose.Types.ObjectId(entityId),
    entityModel,
  }));

  const notificationService = new NotificationService();
  await notificationService.createNotifications(notificationPayloads);
  console.log(`[Worker] Job ${job.id}: Saved ${notificationPayloads.length} notification records to DB.`);

  const actor = await UserModel.findById(actorId).select('username').lean();
  const actorName = actor?.username || 'Hệ thống';

  const { title, body } = getPushContent(type, actorName);
  const dataForPush = { entityId: entityId.toString(), entityModel };

  console.log(`[Worker] Job ${job.id}: Preparing to send push notifications with title: "${title}"`);
  for (const recipientId of recipientIds) {
    await pushNotificationService.sendPushNotification(recipientId, title, body, dataForPush);
  }
  console.log(`[Worker] Job ${job.id}: Finished sending push notifications.`);
};

const notificationWorker = new Worker(NOTIFICATION_QUEUE_NAME, processNotificationJob, {
  connection: redisConnection,
  concurrency: 10,
  removeOnComplete: {
    age: 3600,
  },
  removeOnFail: {
    age: 24 * 3600,
  },
});

notificationWorker.on('completed', (job: Job) => {
  console.log(`[Event] Job with id ${job.id} has been completed.`);
});

notificationWorker.on('failed', (job: Job<NotificationJobPayload> | undefined, err: Error) => {
  if (job) {
    console.error(`[Event] Job with id ${job.id} has failed. Error: ${err.message}`);
  } else {
    console.error(`[Event] An unknown job has failed. Error: ${err.message}`);
  }
});

console.log('🚀 Notification worker is up and running.');