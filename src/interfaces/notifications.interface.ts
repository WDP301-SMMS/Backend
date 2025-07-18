import { NotificationType } from '@/enums/NotificationEnums';
import { Types } from 'mongoose';


export interface INotification {
  recipientId: Types.ObjectId;
  type: NotificationType;
  isRead: boolean;
  entityId: Types.ObjectId;
  entityModel: string;
  createdAt: Date;
}