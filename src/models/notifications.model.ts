import { NotificationType } from '@/enums/NotificationEnums';
import { INotification } from '@/interfaces/notifications.interface';
import mongoose, { Schema } from 'mongoose';


const NotificationSchema = new Schema<INotification>({
  recipientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  entityId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  entityModel: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);