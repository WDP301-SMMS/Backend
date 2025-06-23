import { Request, Response, NextFunction } from 'express';
import { uploadMiddleware } from './multer';
import { uploadToFirebase } from '@/services/upload.service';

export const handleUploadFile = (fieldName: string, outputKey?: string) => {
  return [
    uploadMiddleware.single(fieldName),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (req.file) {
          const url = await uploadToFirebase(req.file);
          req.body[outputKey || fieldName] = url;
        }
        next();
      } catch (error) {
        next(error);
      }
    },
  ];
};
