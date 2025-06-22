import { StudentGender, StudentStatus } from '@/enums/StudentEnum';
import { IStudent } from '@/interfaces/student.interface';
import mongoose, { Schema } from 'mongoose';

const StudentSchema = new Schema<IStudent>(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
        isActive: {
          type: Boolean,
          default: true,
        },
        createdAt: {
          type: Date,
        },
      },
      default: null,
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
