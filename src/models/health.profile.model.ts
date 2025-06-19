import {
  IHealthProfile,
  IInjectedVaccine,
} from '@/interfaces/health.profile.interface';
import mongoose, { Schema } from 'mongoose';

const InjectedVaccineSchema = new Schema<IInjectedVaccine>({
  vaccineName: { type: String, required: true },
  doseNumber: { type: Number, required: true },
});

const HealthProfileSchema = new Schema<IHealthProfile>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    allergies: { type: String, required: true },
    chronicConditions: { type: String, required: true },
    visionStatus: { type: String, required: true },
    hearingStatus: { type: String, required: true },
    vaccines: [InjectedVaccineSchema],
  },
  {
    collection: 'HealthProfile',
  },
);

export const HealthProfileModel = mongoose.model<IHealthProfile>(
  'HealthProfile',
  HealthProfileSchema,
);
