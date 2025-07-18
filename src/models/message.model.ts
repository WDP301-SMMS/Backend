import mongoose, { Schema } from 'mongoose';
import { MessageType, IMessage } from '@/interfaces/message.interface';

const messageSchema = new Schema<IMessage>(
  {
    roomId: {
      type: String,
      required: true,
      trim: true,
    },
    senderId: {
      type: String,
      required: true,
      trim: true,
    },
    receiverId: {
      type: String,
      required: true,
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

const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message;
