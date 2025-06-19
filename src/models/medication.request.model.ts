import {
  IMedicationRequest,
  IRequestItem,
} from '@/interfaces/medication.request.interface';
import mongoose, { Schema } from 'mongoose';

const MedicationRequestSchema = new Schema<IMedicationRequest>(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
      required: true,
    },
  },
  { collection: 'MedicationRequest' },
);

const RequestItemSchema = new Schema<IRequestItem>(
  {
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
  },
  { collection: 'RequestItem' },
);

export const MedicationRequestModel = mongoose.model<IMedicationRequest>(
  'MedicationRequest',
  MedicationRequestSchema,
);
export const RequestItemModel = mongoose.model<IRequestItem>(
  'RequestItem',
  RequestItemSchema,
);
