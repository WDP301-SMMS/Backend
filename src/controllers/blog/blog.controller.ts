import { NextFunction, Request, Response } from 'express';

import { IUser } from '@/interfaces/user.interface';
import { BlogService } from '@/services/blog/blog.service';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export class BlogController {
  public blogService = new BlogService();

  public createPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const postData = req.body;
      const authorId = req.user!._id!.toString();

      const newPost = await this.blogService.createPost(postData, authorId);
      res.status(201).json({ data: newPost, message: 'Blog post created successfully.' });
    } catch (error) {
      next(error);
    }
  };

  public getPostById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const post = await this.blogService.getPostById(id);
      res.status(200).json({ data: post, message: 'Blog post retrieved successfully.' });
    } catch (error) {
      next(error);
    }
  };

  public getAllPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query;
      const result = await this.blogService.getAllPosts(query);
      res.status(200).json({ ...result, message: 'Blog posts retrieved successfully.' });
    } catch (error) {
      next(error);
    }
  };

  public updatePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedPost = await this.blogService.updatePost(id, updateData);
      res.status(200).json({ data: updatedPost, message: 'Blog post updated successfully.' });
    } catch (error) {
      next(error);
    }
  };

  public deletePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.blogService.deletePost(id);
      res.status(200).json({ ...result, success: true });
    } catch (error) {
      next(error);
    }
  };
}