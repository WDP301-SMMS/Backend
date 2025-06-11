import { CampaignStatus, ExecutionType } from '@/enums/HealthCheckCampaignEnum';
import { IHealthCheckCampaign } from '@/interfaces/healthcheck.campaign.interface';
import mongoose, { Schema, model, Document } from 'mongoose';



const HealthCheckCampaignSchema= new Schema(
  {
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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: IHealthCheckCampaign, endDate: Date) {
          return endDate >= this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    templateId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'HealthCheckTemplate',
    },
    targetGradeLevels: {
      type: [Number],
      required: true,
      validate: {
        validator: (grades: number[]) => grades.length > 0 && grades.every(grade => Number.isInteger(grade) && grade > 0),
        message: 'Target grade levels must be positive integers',
      },
    },
    executionType: {
      type: String,
      required: true,
      enum: Object.values(ExecutionType),
    },
    partnerId: {
      type: Schema.Types.ObjectId,
      required: function (this: IHealthCheckCampaign) {
        return this.executionType === ExecutionType.EXTERNAL;
      },
      ref: 'HealthcareOrganization',
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(CampaignStatus),
      default: CampaignStatus.DRAFT,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
);

export const HealthCheckCampaign = mongoose.model<IHealthCheckCampaign>(
  'HealthCheckCampaign',
  HealthCheckCampaignSchema
);
