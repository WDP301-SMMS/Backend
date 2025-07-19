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
  content: string | IFileData;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFileData {
  data: string; // base64 encoded file data
  filename: string;
  mimetype: string;
}
