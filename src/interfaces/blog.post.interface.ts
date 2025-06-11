import { Types } from "mongoose";

export interface IBlogPost {
  authorId: Types.ObjectId;
  title: string;
  content: string;
  publishedAt: Date;
}