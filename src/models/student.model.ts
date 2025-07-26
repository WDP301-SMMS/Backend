import { StudentGender, StudentStatus } from '@/enums/StudentEnum';
import { IStudent } from '@/interfaces/student.interface';
import generateOtp from '@/utils/otp';
import mongoose, { Schema } from 'mongoose';

const StudentSchema = new Schema<IStudent>(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: StudentGender,
      required: true,
    },
    invitedCode: {
      type: {
        code: {
          type: String,
          required: true,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
      default: () => ({
        code: generateOtp(),
      }),
      _id: false,
    },
    status: {
      type: String,
      enum: StudentStatus,
      required: true,
    },
  },
  { timestamps: true },
);

export const StudentModel = mongoose.model<IStudent>('Student', StudentSchema);
