import { ConsentStatus } from '@/enums/ConsentsEnum';
import { IHealthCheckConsent } from '@/interfaces/healthcheck.consents.interface';
import mongoose, { Schema, model, Document } from 'mongoose';


const HealthCheckConsentSchema = new Schema(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'HealthCheckCampaign',
    },
    studentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    parentId: {
      type: Schema.Types.ObjectId,
      required: true,
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
        return this.status === ConsentStatus.APPROVED || this.status === ConsentStatus.DECLINED;
      },
      default: null,
    },
  },
);

// Ensure unique combination of campaignId and studentId
HealthCheckConsentSchema.index({ campaignId: 1, studentId: 1 }, { unique: true });

export const HealthCheckConsent = mongoose.model<IHealthCheckConsent>(
  'HealthCheckConsent',
  HealthCheckConsentSchema
);
