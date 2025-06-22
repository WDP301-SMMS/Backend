import { SlotEnum } from '@/enums/SlotEnum';
import { IMedicationSchedule } from '@/interfaces/medication.schedule.interface';
import mongoose, { Schema } from 'mongoose';

const MedicationScheduleSchema: Schema = new Schema<IMedicationSchedule>({
  medicationRequestId: {
    type: Schema.Types.ObjectId,
    ref: 'MedicationRequest',
    required: true,
    index: true,
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true,
  },
  nurseId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sessionSlots: {
    type: String,
    enum: Object.values(SlotEnum),
    required: true,
  },
  status: { type: String, required: true },
  date: {
    type: Date,
    required: true,
    index: true,
  },
});

export const MedicationScheduleModel = mongoose.model<IMedicationSchedule>(
  'MedicationSchedule',
  MedicationScheduleSchema,
);
