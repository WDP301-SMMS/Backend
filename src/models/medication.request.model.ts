import {
  IMedicationRequest,
  IRequestItem,
} from '@/interfaces/medication.request.interface';
import { MedicationRequestEnum } from '@/enums/MedicationEnum';
import mongoose, { Schema } from 'mongoose';

const MedicationRequestSchema = new Schema<IMedicationRequest>({
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  prescriptionFile: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(MedicationRequestEnum),
    default: MedicationRequestEnum.Pending,
    required: true,
  },
});

const RequestItemSchema = new Schema<IRequestItem>({
  medicationRequestId: {
    type: Schema.Types.ObjectId,
    ref: 'MedicationRequest',
    required: true,
  },
  medicationName: {
    type: String,
    required: true,
  },
  dosage: {
    type: String,
    required: true,
  },
  instruction: {
    type: String,
    required: true,
  },
});

export const MedicationRequestModel = mongoose.model<IMedicationRequest>(
  'MedicationRequest',
  MedicationRequestSchema,
);
export const RequestItemModel = mongoose.model<IRequestItem>(
  'RequestItem',
  RequestItemSchema,
);
