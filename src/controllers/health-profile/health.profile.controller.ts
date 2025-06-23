import { Request, Response, NextFunction } from 'express';
import { IUser } from '@/interfaces/user.interface';
import { AppError } from '@/utils/globalErrorHandler';
import { StudentModel } from '@/models/student.model';
import { HealthProfileModel } from '@/models/health.profile.model';
import { HealthProfileService } from '@/services/health-profile/health.profile.service';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const profileService = new HealthProfileService();

export class HealthProfileController {
  
  public createProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parentId = req.user?._id;
      if (!parentId) {
        const error: AppError = new Error('User authentication error: Parent ID not found.');
        error.status = 401;
        throw error;
      }

      const newProfile = await profileService.createProfile(parentId, req.body);

      res.status(201).json({
        success: true,
        message: 'Health profile created successfully and linked to student.',
        data: newProfile,
      });
    } catch (error) {
      next(error);
    }
  };

  public getProfileByStudentId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId } = req.params;
      const profile = await profileService.getProfileByStudentId(studentId);

      res.status(200).json({
        success: true,
        message: 'Health profile retrieved successfully.',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { profileId } = req.params;
      const parentId = req.user?._id;

      if (!parentId) {
        const error: AppError = new Error('User authentication error: Parent ID not found.');
        error.status = 401;
        throw error;
      }


      const profile = await HealthProfileModel.findById(profileId);
      if (!profile) {
        const error: AppError = new Error('Health profile not found.');
        error.status = 404;
        throw error;
      }


      const student = await StudentModel.findById(profile.studentId);
      if (!student || !student.parentId || !student.parentId.equals(parentId)) {
          const error: AppError = new Error('Forbidden: You do not have permission to update this profile.');
          error.status = 403;
          throw error;
      }

      const updatedProfile = await profileService.updateProfile(profileId, req.body);

      res.status(200).json({
        success: true,
        message: 'Health profile updated successfully.',
        data: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  };

    public deleteProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { profileId } = req.params;
      const parentId = req.user?._id;

      if (!parentId) {
          const error: AppError = new Error('User authentication error: Parent ID not found.');
          error.status = 401;
          throw error;
      }

      const profileToDelete = await HealthProfileModel.findById(profileId);
      if (!profileToDelete) {
        const error: AppError = new Error('Health profile not found.');
        error.status = 404;
        throw error;
      }

      const student = await StudentModel.findById(profileToDelete.studentId);
      if (!student || !student.parentId || !student.parentId.equals(parentId)) {
          const error: AppError = new Error('Forbidden: You do not have permission to delete this profile.');
          error.status = 403;
          throw error;
      }

      const result = await profileService.deleteProfile(profileId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
}