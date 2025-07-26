import mongoose, { Schema, Types } from 'mongoose';
import { MessageType, IMessage } from '@/interfaces/message.interface';

const messageSchema = new Schema<IMessage>(
  {
    roomId: {
      type: String,
      required: true,
      trim: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      trim: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(MessageType),
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Message = mongoose.model<IMessage>('Message', messageSchema);
