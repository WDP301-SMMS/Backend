import { Types } from "mongoose";

export interface IAuthorInfo {
  _id: Types.ObjectId;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
}

export interface IBlogPost {
  authorInfo: IAuthorInfo;
  title: string;
  coverImageUrl: string; // <-- THÊM TRƯỜNG MỚI
  content: string;
  publishedAt: Date;
  readingTime?: number;
}