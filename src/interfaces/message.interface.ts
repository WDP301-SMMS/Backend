import { Document } from "mongoose";

export enum MessageType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    FILE = 'FILE',
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