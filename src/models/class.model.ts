import { IClass } from '@/interfaces/class.interface';
import mongoose, { Schema } from 'mongoose';

const ClassSchema: Schema = new Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
    },
    gradeLevel: {
      type: Number,
      required: false,
      min: [1, 'Grade level must be a positive integer'],
    },
    schoolYear: {
      type: String,
      required: false,
      trim: true,
      match: [/^\d{4}-\d{4}$/, 'School year must be in format YYYY-YYYY'],
    },
    totalStudents: {
      type: Number,
      required: true,
      min: [0, 'Total students cannot be negative'],
      validate: {
        validator: function (this: IClass) {
          return this.totalStudents === this.students.length;
        },
        message: 'Total students must match the number of students in the students array',
      },
    },
    students: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique combination of className, gradeLevel, and schoolYear
ClassSchema.index({ className: 1, gradeLevel: 1, schoolYear: 1 }, { unique: true, partialFilterExpression: { gradeLevel: { $exists: true }, schoolYear: { $exists: true } } });

export const Class = mongoose.model<IClass>('Class', ClassSchema);
