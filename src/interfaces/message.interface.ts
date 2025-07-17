import { Document } from "mongoose";

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
}

export interface IMessage extends Document{
    roomId: string;
    senderId: string;
    receiverId: string;
    type: MessageType;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
}