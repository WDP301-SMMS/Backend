import { IHealthCheckRecord } from '@/interfaces/healthcheck.record.interface';
import mongoose from 'mongoose';

const HealthCheckRecordSchema = new mongoose.Schema<IHealthCheckRecord>(
  {
    resultId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'HealthCheckResult',
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Student',
    },
    latestResultId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'HealthCheckResult',
    },
  },
  { timestamps: true },
);

export const HealthCheckRecordModel = mongoose.model<IHealthCheckRecord>(
  'HealthCheckRecord',
  HealthCheckRecordSchema,
);
