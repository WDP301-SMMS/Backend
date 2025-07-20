import mongoose, { Schema } from 'mongoose';
import { IBlogPost, IAuthorInfo } from '@/interfaces/blog.post.interface';

const AuthorInfoSchema = new Schema<IAuthorInfo>({
  _id: { type: Schema.Types.ObjectId, required: true },
  fullName: { type: String, required: true, trim: true },
  avatarUrl: { type: String, trim: true },
  bio: { type: String, trim: true },
}, { _id: false });

const BlogPostSchema = new Schema<IBlogPost>({
  authorInfo: {
    type: AuthorInfoSchema,
    required: true,
  },
  title: { type: String, required: true },
  coverImageUrl: { type: String, required: true }, // <-- THÊM TRƯỜNG MỚI
  content: { type: String, required: true },
  publishedAt: { type: Date, required: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

BlogPostSchema.virtual('readingTime').get(function(this: IBlogPost) {
  if (!this.content) return 0;
  const wordsPerMinute = 200;
  const textLength = this.content.split(/\s+/).length;
  return textLength > 0 ? Math.ceil(textLength / wordsPerMinute) : 0;
});

export const BlogPostModel = mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);