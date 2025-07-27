import { Request, Response, NextFunction } from 'express';
import { IUser } from '@/interfaces/user.interface';
import { StudentModel } from '@/models/student.model';
import { HealthProfileModel } from '@/models/health.profile.model';
import { AppError } from '@/utils/globalErrorHandler';
import { HealthProfileService } from '@/services/health-profile/health.profile.service';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const parentService = new HealthProfileService();

export class HealthProfileController {
  public claimStudent = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parentId = req.user?._id;
      if (!parentId) {
        const error: AppError = new Error(
          'User authentication error: Parent ID not found.',
        );
        error.status = 401;
        throw error;
      }

      const { invitedCode } = req.body;
      if (!invitedCode) {
        const error: AppError = new Error('Invitation code is required.');
        error.status = 400;
        throw error;
      }

      const result = await parentService.claimStudentByCode(
        parentId,
        invitedCode,
      );

      res.status(200).json({
        success: true,
        message: 'Student connected successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getMyStudents = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parentId = req.user?._id;
      if (!parentId) {
        const error: AppError = new Error(
          'User authentication error: Parent ID not found.',
        );
        error.status = 401;
        throw error;
      }

      const students = await parentService.getMyStudents(parentId);

      res.status(200).json({
        success: true,
        message: 'Your students retrieved successfully.',
        data: students,
      });
    } catch (error) {
      next(error);
    }
  };

  private async checkStudentOwnership(
    parentId: string,
    studentId: string,
  ): Promise<void> {
    const student = await StudentModel.findById(studentId);
    if (!student || !student.parentId || !student.parentId.equals(parentId)) {
      const error: AppError = new Error(
        "Forbidden: You do not have permission to access this student's data.",
      );
      error.status = 403;
      throw error;
    }
  }

  public createProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parentId = req.user?._id;
      const { studentId, ...payload } = req.body;

      if (!parentId) {
        const error: AppError = new Error(
          'User authentication error: Parent ID not found.',
        );
        error.status = 401;
        throw error;
      }
      if (!studentId) {
        const error: AppError = new Error('Student ID is required.');
        error.status = 400;
        throw error;
      }

      await this.checkStudentOwnership(parentId, studentId);

      const newProfile = await parentService.createProfile(studentId, payload);

      res.status(201).json({
        success: true,
        message: 'Health profile created successfully.',
        data: newProfile,
      });
    } catch (error) {
      next(error);
    }
  };

  public getProfileByStudentId = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { studentId } = req.params;
      const user = req.user;

      if (!user) {
        const error: AppError = new Error('User authentication error.');
        error.status = 401;
        throw error;
      }

      if (!user._id) {
        const error: AppError = new Error(
          'User authentication error: User ID is missing in token.',
        );
        error.status = 401;
        throw error;
      }
      await this.checkStudentOwnership(user._id, studentId);

      const profile = await parentService.getProfileByStudentId(studentId);

      res.status(200).json({
        success: true,
        message: 'Health profile retrieved successfully.',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { profileId } = req.params;
      const parentId = req.user?._id;

      if (!parentId) {
        const error: AppError = new Error(
          'User authentication error: Parent ID not found.',
        );
        error.status = 401;
        throw error;
      }

      const profile = await HealthProfileModel.findById(profileId);
      if (!profile) {
        const error: AppError = new Error('Health profile not found.');
        error.status = 404;
        throw error;
      }

      await this.checkStudentOwnership(parentId, profile.studentId.toString());

      const updatedProfile = await parentService.updateProfile(
        profileId,
        req.body,
      );

      res.status(200).json({
        success: true,
        message: 'Health profile updated successfully.',
        data: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { profileId } = req.params;
      const parentId = req.user?._id;

      if (!parentId) {
        const error: AppError = new Error(
          'User authentication error: Parent ID not found.',
        );
        error.status = 401;
        throw error;
      }

      const profile = await HealthProfileModel.findById(profileId);
      if (!profile) {
        const error: AppError = new Error('Health profile not found.');
        error.status = 404;
        throw error;
      }

      await this.checkStudentOwnership(parentId, profile.studentId.toString());

      const result = await parentService.deleteProfile(profileId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
}
