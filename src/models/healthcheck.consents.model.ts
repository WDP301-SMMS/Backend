import { ConsentStatus } from '../enums/ConsentsEnum';
import { IHealthCheckConsent } from '@/interfaces/healthcheck.consents.interface';
import mongoose, { Schema, model, Document } from 'mongoose';

const HealthCheckConsentSchema = new Schema<IHealthCheckConsent>({
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
  parentId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  classId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Class',
  },
  nurseId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(ConsentStatus),
    default: ConsentStatus.PENDING,
  },
  reasonForDeclining: {
    type: String,
    required: function (this: IHealthCheckConsent) {
      return this.status === ConsentStatus.DECLINED;
    },
    trim: true,
    default: null,
  },
  confirmedAt: {
    type: Date,
    required: function (this: IHealthCheckConsent) {
      return (
        this.status === ConsentStatus.APPROVED ||
        this.status === ConsentStatus.DECLINED
      );
    },
    default: null,
  },
});

export const HealthCheckConsent = mongoose.model<IHealthCheckConsent>(
  'HealthCheckConsent',
  HealthCheckConsentSchema,
);
