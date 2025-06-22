import { DataSource, ResultStatus } from '../enums/HealthCheckResultEnum';
import { IHealthCheckResult } from '@/interfaces/healthcheck.result.interface';
import mongoose, { Schema, model, Document } from 'mongoose';

const HealthCheckResultSchema: Schema = new Schema<IHealthCheckResult>({
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
  nurseId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  checkupDate: {
    type: Date,
    required: true,
  },
  resultsData: {
    type: [
      {
        itemName: {
          type: String,
          required: true,
          ref: 'HealthCheckTemplateItem',
        },
        value: {
          type: Schema.Types.Mixed,
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
        guideline: {
          type: String,
          required: false,
        },
      },
    ],
    required: true,
    default: [],
  },
  overallConclusion: {
    type: String,
    required: false,
    trim: true,
  },
  recommendations: {
    type: String,
    required: false,
    trim: true,
  },
});

export const HealthCheckResult = mongoose.model<IHealthCheckResult>(
  'HealthCheckResult',
  HealthCheckResultSchema,
);
