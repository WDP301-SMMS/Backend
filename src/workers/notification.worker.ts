import mongoose from 'mongoose';
import { Worker, Job } from 'bullmq';
import redisConnection from '@/config/redis';
import { NotificationType } from '@/enums/NotificationEnums';
import { INotification } from '@/interfaces/notifications.interface';
import { NOTIFICATION_QUEUE_NAME, NotificationJobPayload } from '@/queues/notification.queue';
import { NotificationService } from '@/services/notifications/notification.service';
import { pushNotificationService } from '@/services/notifications/push-notification.service';
import { VaccinationCampaignModel } from '@/models/vaccination.campaign.model';
import { HealthCheckCampaign } from '@/models/healthcheck.campaign.model';
import connectDB from '@/config/database';

interface RelatedData {
  campaignName?: string;
}


const getPushContent = (type: NotificationType, data: RelatedData): { title: string; body: string } => {
  switch (type) {
    case NotificationType.HEALTH_CHECK_CAMPAIGN_NEW:
      return {
        title: 'Khám Sức Khỏe',
        body: `Nhà trường vừa công bố chiến dịch mới: ${data.campaignName || 'Chiến dịch khám sức khỏe'}.`,
      };

    case NotificationType.HEALTH_CHECK_RESULT_READY:
      return {
        title: 'Kết Quả Sức Khỏe',
        body: 'Kết quả khám sức khỏe của con bạn đã có. Vui lòng kiểm tra chi tiết trong ứng dụng.',
      };

    case NotificationType.VACCINE_CAMPAIGN_NEW:
      return {
        title: 'Chiến Dịch Tiêm Chủng',
        body: `Nhà trường vừa công bố chiến dịch mới: ${data.campaignName || 'Chiến dịch tiêm chủng'}.`,
      };

    case NotificationType.MEDICATION_REQUEST_SCHEDULED:
      return {
        title: 'Lịch Uống Thuốc',
        body: `Yêu cầu cấp thuốc cho con bạn đã được y tá lên lịch.`,
      };

    case NotificationType.MEDICATION_REQUEST_COMPLETED:
      return {
        title: 'Hoàn Thành Uống Thuốc',
        body: `Con bạn đã hoàn thành toàn bộ lịch uống thuốc theo yêu cầu.`,
      };

    case NotificationType.MEDICATION_REQUEST_REJECTED:
      return {
        title: 'Yêu Cầu Bị Từ Chối',
        body: `Yêu cầu cấp thuốc cho con bạn đã bị từ chối. Vui lòng kiểm tra chi tiết.`,
      };

    // case NotificationType.MEETING_SCHEDULE_NEW:
    //   return {
    //     title: 'Lịch Hẹn Mới',
    //     body: `Bạn có lịch hẹn mới với y tá vào ${data.scheduleTime || 'thời gian được chỉ định'}.`,
    //   };

    case NotificationType.MEETING_SCHEDULE_UPDATED:
      return {
        title: 'Lịch Hẹn Được Cập Nhật',
        body: `Lịch hẹn với y tá đã được cập nhật. Vui lòng kiểm tra chi tiết.`,
      };

    case NotificationType.MEETING_SCHEDULE_CANCELED:
      return {
        title: 'Lịch Hẹn Bị Hủy',
        body: `Lịch hẹn với y tá đã bị hủy. Vui lòng đặt lại nếu cần.`,
      };

    case NotificationType.MEDICAL_INCIDENT_PARENT_ALERT:
      return {
        title: 'Thông Báo Sự Cố Y Tế',
        body: 'Có một sự cố y tế liên quan đến con bạn. Vui lòng kiểm tra thông tin chi tiết.',
      };

    default:
      return {
        title: 'Thông Báo Mới',
        body: 'Bạn có một thông báo mới từ School Health.',
      };
  }
};

const startWorker = async () => {
  try {
    await connectDB();

    const processNotificationJob = async (job: Job<NotificationJobPayload>) => {
      console.log(`[Worker] Processing job ${job.id}`);
      const { recipientIds, type, entityId, entityModel } = job.data;

      if (!recipientIds || recipientIds.length === 0) {
        console.warn(`[Worker] Job ${job.id} has no recipients. Skipping.`);
        return;
      }

      const notificationPayloads: Omit<INotification, 'isRead' | 'createdAt'>[] = recipientIds.map((id: string) => ({
        recipientId: new mongoose.Types.ObjectId(id),
        type,
        entityId: new mongoose.Types.ObjectId(entityId),
        entityModel,
      }));

      const notificationService = new NotificationService();
      await notificationService.createNotifications(notificationPayloads);
      console.log(`[Worker] Job ${job.id}: Saved ${notificationPayloads.length} notification records to DB.`);

      let relatedData: RelatedData = {};
      if (entityModel === 'VaccinationCampaign') {
        const campaign = await VaccinationCampaignModel.findById(entityId).select('name').lean();
        relatedData.campaignName = campaign?.name;
      } else if (entityModel === 'HealthCheckCampaign') {
        const campaign = await HealthCheckCampaign.findById(entityId).select('name').lean();
        relatedData.campaignName = campaign?.name;
      }

      const { title, body } = getPushContent(type, relatedData);
      const dataForPush = { entityId: entityId.toString(), entityModel };

      console.log(`[Worker] Job ${job.id}: Preparing to send push notifications with title: "${title}"`);
      for (const recipientId of recipientIds) {
        try {
          await pushNotificationService.sendPushNotification(recipientId, title, body, dataForPush);
        } catch (error) {
          console.error(`[Worker] Failed to send push to recipient ${recipientId} for job ${job.id}. Error:`, error);
        }
      }
      console.log(`[Worker] Job ${job.id}: Finished sending push notifications.`);
    };

    const notificationWorker = new Worker(NOTIFICATION_QUEUE_NAME, processNotificationJob, {
      connection: redisConnection,
      concurrency: 10,
      removeOnComplete: { age: 3600 },
      removeOnFail: { age: 24 * 3600 },
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
  } catch (error) {
    console.error('Failed to start notification worker:', error);
    process.exit(1);
  }
};

startWorker();