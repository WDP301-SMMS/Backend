import mongoose from 'mongoose';
import { IStudent } from '@/interfaces/student.interface';
import { IHealthProfile } from '@/interfaces/health.profile.interface';
import { StudentModel } from '@/models/student.model';
import { HealthProfileModel } from '@/models/health.profile.model';
import { AppError } from '@/utils/globalErrorHandler';
import { IClass } from '@/interfaces/class.interface';
import { IUser } from '@/interfaces/user.interface';

type ICreateProfilePayload = Omit<IHealthProfile, 'studentId'>;

type IUpdateProfilePayload = Partial<ICreateProfilePayload>;

export class HealthProfileService {
  public async claimStudentByCode(
    parentId: string,
    invitedCode: string,
  ): Promise<IStudent> {
    const student = await StudentModel.findOne({
      'invitedCode.code': invitedCode,
      'invitedCode.isActive': true,
    });

    if (!student) {
      const error: AppError = new Error(
        'Invalid or already used invitation code.',
      );
      error.status = 404;
      throw error;
    }

    if (student.parentId) {
      const error: AppError = new Error(
        'This student is already linked to another parent account.',
      );
      error.status = 409;
      throw error;
    }

    student.parentId = new mongoose.Types.ObjectId(parentId);
    if (student.invitedCode) {
      student.invitedCode.isActive = false;
    }

    await student.save();

    await student.populate({
      path: 'classId',
      select: 'className',
    });
    return student;
  }

  public async getMyStudents(parentId: string): Promise<any[]> {
    // Trả về Promise<any[]> để linh hoạt
    type PopulatedStudent = Omit<IStudent, 'parentId' | 'classId'> & {
      parentId: Omit<IUser, 'password'>; // Loại bỏ trường password
      classId: IClass;
    };

    const students = await StudentModel.find({ parentId: parentId }).populate([
      {
        path: 'classId',
        select: 'className gradeLevel',
      },
      {
        path: 'parentId',
        select: '-password -__v',
      },
    ]);

    return students;
  }

  public async createProfile(
    studentId: string,
    payload: ICreateProfilePayload,
  ): Promise<IHealthProfile> {
    const existingProfile = await HealthProfileModel.findOne({ studentId });
    if (existingProfile) {
      const error: AppError = new Error(
        'A health profile for this student already exists.',
      );
      error.status = 409;
      throw error;
    }

    const newProfile = new HealthProfileModel({
      ...payload,
      studentId: studentId,
    });

    await newProfile.save();
    return newProfile;
  }

  public async getProfileByStudentId(
    studentId: string,
  ): Promise<IHealthProfile & { studentInfo: IStudent }> {
    const profile = await HealthProfileModel.findOne({ studentId }).lean();

    if (!profile) {
      const error: AppError = new Error(
        'Health profile not found for this student.',
      );
      error.status = 404;
      throw error;
    }

    const student = await StudentModel.findById(studentId).lean();
    if (!student) {
      const error: AppError = new Error('Student not found.');
      error.status = 404;
      throw error;
    }

    return {
      ...profile,
      studentInfo: {
        fullName: student.fullName,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        classId: student.classId,
        status: student.status,
      },
    };
  }

  public async updateProfile(
    profileId: string,
    payload: IUpdateProfilePayload,
  ): Promise<IHealthProfile> {
    const updatedProfile = await HealthProfileModel.findByIdAndUpdate(
      profileId,
      { $set: payload },
      { new: true, runValidators: true },
    );

    if (!updatedProfile) {
      const error: AppError = new Error('Health profile not found.');
      error.status = 404;
      throw error;
    }
    return updatedProfile;
  }

  public async deleteProfile(profileId: string): Promise<{ message: string }> {
    const result = await HealthProfileModel.findByIdAndDelete(profileId);

    if (!result) {
      const error: AppError = new Error('Health profile not found.');
      error.status = 404;
      throw error;
    }
    return { message: 'Health profile deleted successfully.' };
  }
}
