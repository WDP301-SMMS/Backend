import * as admin from 'firebase-admin';
import { UserModel } from '@/models/user.model';

// Lưu ý quan trọng: Trong môi trường production, bạn nên tải file key này
// từ một nơi an toàn hoặc truyền nội dung của nó qua biến môi trường,
// thay vì hardcode đường dẫn.
try {
  const serviceAccount = require('/path/to/your/serviceAccountKey.json');

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK. Make sure the service account key file path is correct.', error);
}


class PushNotificationService {
  public async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: { [key: string]: string },
  ): Promise<void> {
    
    // Kiểm tra xem SDK đã được khởi tạo thành công chưa
    if (admin.apps.length === 0) {
      console.error('Firebase Admin SDK is not initialized. Skipping push notification.');
      return;
    }

    const user = await UserModel.findById(userId).select('pushTokens').lean();

    if (!user || !user.pushTokens || user.pushTokens.length === 0) {
      console.log(`User ${userId} has no push tokens. Skipping push notification.`);
      return;
    }

    const tokens = user.pushTokens;

    const message: admin.messaging.MulticastMessage = {
      notification: {
        title,
        body,
      },
      data: data || {},
      tokens: tokens,
      android: {
        priority: 'high' as const,
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            contentAvailable: true,
          },
        },
      },
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      
      console.log(`Push notification sent for user ${userId}: ${response.successCount} success, ${response.failureCount} failure.`);

      const tokensToRemove: string[] = [];
      response.responses.forEach((result, index) => {
        if (!result.success) {
          const errorCode = result.error?.code;
          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered'
          ) {
            console.log(`Invalid token found: ${tokens[index]}. Scheduling for removal.`);
            tokensToRemove.push(tokens[index]);
          }
        }
      });

      if (tokensToRemove.length > 0) {
        await UserModel.updateOne(
          { _id: userId },
          { $pullAll: { pushTokens: tokensToRemove } }
        );
        console.log(`Removed ${tokensToRemove.length} invalid tokens for user ${userId}.`);
      }

    } catch (error) {
      console.error(`Error sending multicasting message for user ${userId}:`, error);
    }
  }
}

export const pushNotificationService = new PushNotificationService();