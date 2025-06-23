import mongoose from 'mongoose';
import { IHealthProfile } from '@/interfaces/health.profile.interface';
import { HealthProfileModel } from '@/models/health.profile.model';
import { StudentModel } from '@/models/student.model';
import { AppError } from '@/utils/globalErrorHandler';

interface ICreateProfilePayload extends Omit<IHealthProfile, 'studentId'> {
    invitedCode: string;
}

type IUpdateProfilePayload = Partial<Omit<IHealthProfile, 'studentId'>>;

export class HealthProfileService {

    public async createProfile(parentId: string, payload: ICreateProfilePayload): Promise<IHealthProfile> {
        const { invitedCode, ...profileData } = payload;

        const student = await StudentModel.findOne({
            'invitedCode._id': new mongoose.Types.ObjectId(invitedCode),
            'invitedCode.isActive': true
        });

        if (!student) {
            const error: AppError = new Error('Invalid or already used invitation code.');
            error.status = 404;
            throw error;
        }

        if (student.parentId) {
            const error: AppError = new Error('This student is already linked to another parent account.');
            error.status = 409;
            throw error;
        }
        const existingProfile = await HealthProfileModel.findOne({ studentId: student._id });
        if (existingProfile) {
            const error: AppError = new Error('A health profile for this student already exists.');
            error.status = 409;
            throw error;
        }

        if (!student.invitedCode) {
            const error: AppError = new Error('Internal Server Error: Invitation code data is missing.');
            error.status = 500;
            throw error;
        }


        try {
            student.parentId = new mongoose.Types.ObjectId(parentId);
            student.invitedCode.isActive = false;
            await student.save();

            const newProfile = new HealthProfileModel({
                ...profileData,
                studentId: student._id,
            });
            await newProfile.save();

            return newProfile;

        } catch (error) {
            console.error("INCONSISTENCY WARNING: An error occurred during a non-transactional creation of a health profile.", error);

            student.parentId = undefined;
            if (student.invitedCode) {
                student.invitedCode.isActive = true;
            }
            await student.save();

            const appError: AppError = new Error('Failed to create health profile. Please try again.');
            appError.status = 500;
            throw appError;
        }
    }



    public async getProfileByStudentId(studentId: string): Promise<IHealthProfile> {
        const profile = await HealthProfileModel.findOne({ studentId });

        if (!profile) {
            const error: AppError = new Error('Health profile not found for this student.');
            error.status = 404;
            throw error;
        }
        return profile;
    }

    public async updateProfile(profileId: string, payload: IUpdateProfilePayload): Promise<IHealthProfile> {
        const updatedProfile = await HealthProfileModel.findByIdAndUpdate(
            profileId,
            { $set: payload },
            { new: true, runValidators: true }
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