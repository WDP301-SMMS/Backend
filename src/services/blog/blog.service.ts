import { BlogPostModel } from '@/models/blog.post.model';
import { UserModel } from '@/models/user.model';
import { AppError } from '@/utils/globalErrorHandler';

const createAppError = (status: number, message: string): AppError => {
  const error: AppError = new Error(message);
  error.status = status;
  return error;
};

export class BlogService {
  public async createPost(
    postData: { title: string; content: string; publishedAt: Date },
    authorId: string,
  ) {
    const author = await UserModel.findById(authorId).select('username avatarUrl bio').lean();
    if (!author) {
      throw createAppError(404, 'Author not found');
    }

    const authorInfo = {
      _id: author._id,
      fullName: (author as any).username || 'Unnamed Author',
      avatarUrl: (author as any).avatarUrl,
      bio: (author as any).bio,
    };

    const newPost = new BlogPostModel({
      ...postData,
      authorInfo: authorInfo,
    });

    await newPost.save();
    return newPost;
  }

  public async getPostById(postId: string) {
    const post = await BlogPostModel.findById(postId).lean({ virtuals: true });
    if (!post) {
      throw createAppError(404, 'Blog post not found');
    }
    return post;
  }

  public async getAllPosts(query: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      BlogPostModel.find()
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-content') // Exclude full content for list view
        .lean({ virtuals: true }),
      BlogPostModel.countDocuments(),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: posts,
    };
  }

  public async updatePost(
    postId: string,
    updateData: Partial<{ title: string; content: string; publishedAt: Date }>,
  ) {
    const updatedPost = await BlogPostModel.findByIdAndUpdate(
      postId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedPost) {
      throw createAppError(404, 'Blog post not found to update');
    }
    return updatedPost;
  }

  public async deletePost(postId: string) {
    const result = await BlogPostModel.findByIdAndDelete(postId);
    if (!result) {
      throw createAppError(404, 'Blog post not found to delete');
    }
    return { message: 'Blog post deleted successfully.' };
  }
}