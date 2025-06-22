import { CampaignStatus } from '../enums/CampaignEnum';
import { IHealthCheckCampaign } from '@/interfaces/healthcheck.campaign.interface';
import mongoose, { Schema } from 'mongoose';

const HealthCheckCampaignSchema = new Schema<IHealthCheckCampaign>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  schoolYear: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{4}-\d{4}$/, 'School year must be in format YYYY-YYYY'],
  },
  templateId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'HealthCheckTemplate',
  },
  scheduleDate: {
    type: Date,
    required: true,
  },
  participatingStaffs: {
    type: [String],
    required: true,
    default: [],
  },
  assignments: [
    {
      classId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Class',
      },
      nurseId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
    },
  ],
  status: {
    type: String,
    required: true,
    enum: Object.values(CampaignStatus),
    default: CampaignStatus.DRAFT,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
});

export const HealthCheckCampaign = mongoose.model<IHealthCheckCampaign>(
  'HealthCheckCampaign',
  HealthCheckCampaignSchema,
);
