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
  },
  { collection: 'Student' },
);

export const StudentModel = mongoose.model<IStudent>('Student', StudentSchema);
