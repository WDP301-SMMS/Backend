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
    content: string | IFileData;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IFileData {
    data: string; // base64 encoded file data
    filename: string;
    mimetype: string;
}