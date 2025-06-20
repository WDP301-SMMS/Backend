import { ConsentStatus } from '@/enums/ConsentsEnum';
import { IVaccinationConsent } from '@/interfaces/vaccination.consent.interface';
import mongoose, { Schema } from 'mongoose';

const VaccinationConsentSchema = new Schema<IVaccinationConsent>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'VaccinationCampaign',
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(ConsentStatus), 
      default: ConsentStatus.PENDING,
      index: true,
    },
    reasonForDeclining: { 
      type: String,
      trim: true,
    },
    confirmedAt: { 
      type: Date, 
    },
  },
  {
    timestamps: true, 
  }
);


VaccinationConsentSchema.index({ campaignId: 1, studentId: 1 }, { unique: true });

export const VaccinationConsentModel = mongoose.model<IVaccinationConsent>(
  'VaccinationConsent',
  VaccinationConsentSchema,
);
