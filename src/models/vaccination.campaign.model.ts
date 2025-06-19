import { IVaccinationCampaign } from '@/interfaces/vaccination.campaign.interface';
import mongoose, { Schema } from 'mongoose';

const VaccinationCampaignSchema = new Schema<IVaccinationCampaign>(
  {
    vaccineName: { type: String, required: true },
    doseNumber: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String, required: true },
  },
  {
    collection: 'VaccinationCampaign',
  },
);

export const VaccinationCampaignModel = mongoose.model<IVaccinationCampaign>(
  'VaccinationCampaign',
  VaccinationCampaignSchema,
);
