import mongoose, { Schema } from 'mongoose';
import {
  IHealthProfile,
  IAllergy,
  IChronicCondition,
  IMedicalHistoryEvent,
  IVisionCheckup,
  IHearingCheckup,
  IInjectedVaccine,
} from '@/interfaces/health.profile.interface';
import { EAllergySeverity } from '@/enums/AllergyEnums';

const AllergySchema = new Schema<IAllergy>({
  type: { type: String, required: true },
  reaction: { type: String, required: true },
  severity: { type: String, enum: Object.values(EAllergySeverity), required: true },
  notes: { type: String, required: true },
}, { _id: false });

const ChronicConditionSchema = new Schema<IChronicCondition>({
  conditionName: { type: String, required: true },
  diagnosedDate: { type: Date, required: false },
  medication: { type: String, required: true },
  notes: { type: String, required: true },
}, { _id: false });

const MedicalHistoryEventSchema = new Schema<IMedicalHistoryEvent>({
  condition: { type: String, required: true },
  facility: { type: String, required: true },
  treatmentDate: { type: Date, required: true },
  method: { type: String, required: true },
  notes: { type: String, required: false },
}, { _id: false });

const VisionCheckupSchema = new Schema<IVisionCheckup>({
  checkupDate: { type: Date, required: true },
  rightEyeVision: { type: String, required: true },
  leftEyeVision: { type: String, required: true },
  wearsGlasses: { type: Boolean, required: true },
  isColorblind: { type: Boolean, required: true },
  notes: { type: String, required: false },
}, { _id: false });

const HearingCheckupSchema = new Schema<IHearingCheckup>({
  checkupDate: { type: Date, required: true },
  rightEarStatus: { type: String, required: true },
  leftEarStatus: { type: String, required: true },
  usesHearingAid: { type: Boolean, required: true },
  notes: { type: String, required: false },
}, { _id: false });

const InjectedVaccineSchema = new Schema<IInjectedVaccine>({
  vaccineName: { type: String, required: true },
  doseNumber: { type: Number, required: true },
  note: { type: String, required: true },
  dateInjected: { type: Date, required: true },
  locationInjected: { type: String, required: true },
}, { _id: false });

const HealthProfileSchema = new Schema<IHealthProfile>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true,
    index: true,
  },
  allergies: {
    type: [AllergySchema],
    default: [],
  },
  chronicConditions: {
    type: [ChronicConditionSchema],
    default: [],
  },
  medicalHistory: {
    type: [MedicalHistoryEventSchema],
    default: [],
  },
  visionHistory: {
    type: [VisionCheckupSchema],
    default: [],
  },
  hearingHistory: {
    type: [HearingCheckupSchema],
    default: [],
  },
  vaccines: {
    type: [InjectedVaccineSchema],
    default: [],
  },
}, {
  timestamps: true,
});

export const HealthProfileModel = mongoose.model<IHealthProfile>(
  'HealthProfile',
  HealthProfileSchema,
);