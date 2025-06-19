import { IHealthDevelopmentTracker } from '@/interfaces/health.development.tracker.interface';
import mongoose, { Schema } from 'mongoose';


const HistoryEntrySchema: Schema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: [0, 'Value must be non-negative'],
  },
});

const VisionEntrySchema: Schema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  leftEye: {
    type: String,
    required: true,
    trim: true,
  },
  rightEye: {
    type: String,
    required: true,
    trim: true,
  },
});

const HealthDevelopmentTrackerSchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Student',
      unique: true, // Ensures one tracker per student
    },
    heightHistory: {
      type: [HistoryEntrySchema],
      required: true,
      default: [],
    },
    weightHistory: {
      type: [HistoryEntrySchema],
      required: true,
      default: [],
    },
    bmiHistory: {
      type: [HistoryEntrySchema],
      required: true,
      default: [],
    },
    visionHistory: {
      type: [VisionEntrySchema],
      required: true,
      default: [],
    },
    lastUpdatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: false, // No createdAt/updatedAt, as lastUpdatedAt is managed manually
    collection: 'HealthDevelopmentTracker',
  }
);

// Ensure unique studentId
HealthDevelopmentTrackerSchema.index({ studentId: 1 }, { unique: true });

export const HealthDevelopmentTracker = mongoose.model<IHealthDevelopmentTracker>(
  'HealthDevelopmentTracker',
  HealthDevelopmentTrackerSchema
);
