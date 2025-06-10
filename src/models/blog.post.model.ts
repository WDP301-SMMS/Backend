import { IBlogPost } from "@/interfaces/blog.post.interface";
import mongoose, { Schema } from "mongoose";

const BlogPostSchema= new Schema<IBlogPost>({
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, 
  title: { type: String, required: true },
  content: { type: String, required: true },
  publishedAt: { type: Date, required: true },
});

export const BlogPostModel = mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);