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
  type: { type: String, required: false },
  reaction: { type: String, required: false },
  severity: { type: String, enum: Object.values(EAllergySeverity), required: false },
  notes: { type: String, required: false },
}, { _id: false });

const ChronicConditionSchema = new Schema<IChronicCondition>({
  conditionName: { type: String, required: false },
  diagnosedDate: { type: Date, required: false },
  medication: { type: String, required: false },
  notes: { type: String, required: false },
}, { _id: false });

const MedicalHistoryEventSchema = new Schema<IMedicalHistoryEvent>({
  condition: { type: String, required: false },
  facility: { type: String, required: false },
  treatmentDate: { type: Date, required: false },
  method: { type: String, required: false },
  notes: { type: String, required: false },
}, { _id: false });

const VisionCheckupSchema = new Schema<IVisionCheckup>({
  checkupDate: { type: Date, required: false },
  rightEyeVision: { type: String, required: false },
  leftEyeVision: { type: String, required: false },
  wearsGlasses: { type: Boolean, required: false },
  isColorblind: { type: Boolean, required: false },
  notes: { type: String, required: false },
}, { _id: false });

const HearingCheckupSchema = new Schema<IHearingCheckup>({
  checkupDate: { type: Date, required: false },
  rightEarStatus: { type: String, required: false },
  leftEarStatus: { type: String, required: false },
  usesHearingAid: { type: Boolean, required: false },
  notes: { type: String, required: false },
}, { _id: false });

const InjectedVaccineSchema = new Schema<IInjectedVaccine>({
  vaccineName: { type: String, required: false },
  doseNumber: { type: Number, required: false },
  note: { type: String, required: false },
  dateInjected: { type: Date, required: false },
  locationInjected: { type: String, required: false },
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