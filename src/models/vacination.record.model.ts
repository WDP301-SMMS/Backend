import { IObservation, IVaccinationRecord } from '@/interfaces/vacination.record.interface';
import mongoose, { Schema } from 'mongoose';

const ObservationSchema = new Schema<IObservation>(
  {
    observedAt: {
      type: Date,
      required: true,
    },
    temperatureLevel: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      required: false, 
      trim: true,
    },
    isAbnormal: {
      type: Boolean,
      required: true,
      default: false,
    },
    actionsTaken: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const VaccinationRecordSchema = new Schema<IVaccinationRecord>(
  {
    consentId: {
      type: Schema.Types.ObjectId,
      ref: 'VaccinationConsent',
      required: true,
      unique: true, 
      index: true,
    },
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: 'HealthcareOrganization',
      required: true,
      index: true,
    },
    administeredByStaffId: {
      type: Schema.Types.ObjectId,
      ref: 'OrganizationStaff', 
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    postVaccinationChecks: {
      type: [ObservationSchema],
      default: [],
    },
    administeredAt: {
      type: Date,
      required: true,
    },
    vaccineName: {
      type: String,
      required: true,
      trim: true,
    },
    doseNumber: {
      type: Number,
      required: true,
    },
    boosterInjectionDate: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

export const VaccinationRecordModel = mongoose.model<IVaccinationRecord>(
  'VaccinationRecord',
  VaccinationRecordSchema,
);