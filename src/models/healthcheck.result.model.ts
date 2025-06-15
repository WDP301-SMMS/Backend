import { DataSource, ResultStatus } from '../enums/HealthCheckResultEnum';
import { IHealthCheckResult } from '@/interfaces/healthcheck.result.interface';
import mongoose, { Schema, model, Document } from 'mongoose';


const ResultDataSchema: Schema = new Schema({
  itemId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'CheckupItem',
  },
  itemName: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: Schema.Types.Mixed, // Allows NUMBER, TEXT, BOOLEAN, or SELECT values
    required: true,
  },
  unit: {
    type: String,
    required: false,
    trim: true,
    default: null,
  },
  isAbnormal: {
    type: Boolean,
    required: true,
    default: false,
  },
  notes: {
    type: String,
    required: false,
    trim: true,
    default: '',
  },
});

const HealthCheckResultSchema: Schema = new Schema(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'HealthCheckCampaign',
    },
    studentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Student',
    },
    checkupDate: {
      type: Date,
      required: true,
    },
    resultsData: {
      type: [ResultDataSchema],
      required: true,
      default: [],
    },
    overallConclusion: {
      type: String,
      required: false,
      trim: true,
    },
    recommendation: {
      type: String,
      required: false,
      trim: true,
    },
    checkedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    dataSource: {
      type: String,
      required: true,
      enum: Object.values(DataSource),
      default: DataSource.DIRECT_INPUT,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(ResultStatus),
      default: ResultStatus.PENDING_REVIEW,
    },
  },
);

// Ensure unique combination of campaignId and studentId
HealthCheckResultSchema.index({ campaignId: 1, studentId: 1 }, { unique: true });

export const HealthCheckResult = mongoose.model<IHealthCheckResult>(
  'HealthCheckResult',
  HealthCheckResultSchema
);
