import { Document, Types } from 'mongoose';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
}

export interface IMessage extends Document {
  roomId: string;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  type: MessageType;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}
