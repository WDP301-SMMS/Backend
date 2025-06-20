import mongoose, { Schema } from 'mongoose';
import { IVaccinationCampaign } from '@/interfaces/vaccination.campaign.interface';  
import { CampaignStatus } from '@/enums/CampaignEnum';


const VaccinationCampaignSchema = new Schema<IVaccinationCampaign>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    vaccineName: {
      type: String,
      required: true,
      trim: true,
    },
    doseNumber: {
      type: Number,
      required: true,
      min: [1, 'Dose number must be a positive integer'],
    },
    description: {
      type: String,
      trim: true,
    },
    schoolYear: { 
      type: String,
      required: true,
      trim: true,
      match: [/^\d{4}-\d{4}$/, 'School year must be in format YYYY-YYYY'],
      index: true,
    },


    partnerId: { 
      type: Schema.Types.ObjectId,
      ref: 'HealthcareOrganization', 
      required: true,
      index: true,
    },
    targetGradeLevels: {
      type: [Number],
      required: true,
      validate: {
        validator: (grades: number[]) => grades.length > 0 && grades.every(g => Number.isInteger(g) && g > 0),
        message: 'Target grade levels must be an array of positive integers.',
      },
    },

    status: {
      type: String,
      required: true,
      enum: Object.values(CampaignStatus),
      default: CampaignStatus.DRAFT,
      index: true, 
    },
    startDate: { 
      type: Date,
      required: true,
    },
    endDate: { 
      type: Date,
      required: true,
      validate: {
        validator: function (this: { startDate: Date }, endDate: Date) {
          return endDate >= this.startDate;
        },
        message: 'End date must be on or after start date.',
      },
    },
    dispatchedAt: { 
      type: Date,
    },
    actualStartDate: { 
      type: Date,
    },
    completedAt: {
      type: Date,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    canceledBy: { 
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellationReason: { 
      type: String,
      trim: true,
    },
    cancellationDate: { 
      type: Date,
    },
    summary: { 
      totalStudents: { type: Number, default: 0 }, 
      totalConsents: { type: Number, default: 0 }, 
      approved: { type: Number, default: 0 },
      declined: { type: Number, default: 0 },
      administered: { type: Number, default: 0 }, 
    },
  },
  {
    timestamps: true, 
  }
);

export const VaccinationCampaignModel = mongoose.model<IVaccinationCampaign>(
  'VaccinationCampaign',
  VaccinationCampaignSchema,
);