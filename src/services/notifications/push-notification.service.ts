import * as admin from 'firebase-admin';
import { UserModel } from '@/models/user.model';
import schoolHealthApp from '@/config/firebase-school-health'; 

class PushNotificationService {
  public async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: { [key: string]: string },
  ): Promise<void> {
    
    if (!schoolHealthApp) {
      console.error('School Health Firebase App is not initialized. Cannot send push notification.');
      return;
    }

    const user = await UserModel.findById(userId).select('pushTokens').lean();

    if (!user || !user.pushTokens ) {
      console.log(`User ${userId} has no push tokens. Skipping.`);
      return;
    }

    const tokens = user.pushTokens;

    const message: admin.messaging.MulticastMessage = {
      notification: { title, body },
      data: data || {},
      tokens: tokens,
      android: { priority: 'high' },
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
      const response = await schoolHealthApp.messaging().sendEachForMulticast(message);
      
      console.log(`Push sent for user ${userId}: ${response.successCount} success, ${response.failureCount} failure.`);

      const tokensToRemove: string[] = [];
      response.responses.forEach((result, index) => {
        if (!result.success) {
          const errorCode = result.error?.code;
          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered'
          ) {
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
      console.error(`Error sending push notification for user ${userId}:`, error);
    }
  }
}

export const pushNotificationService = new PushNotificationService();