import { IMedicalIncident } from '@/interfaces/medical.incident.interface';
import mongoose, { Schema } from 'mongoose';

const MedicalIncidentSchema: Schema = new Schema<IMedicalIncident>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true,
  }, // Foreign key, indexed for lookups
  nurseId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  }, // Foreign key
  incidentType: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, required: true },
  status: { type: String, required: true },
  actionsTaken: { type: String, required: true },
  note: {
    type: String,
    default: null,
    sparse: true,
  },
  incidentTime: { type: Date, required: true },
});

export const MedicalIncidentModel = mongoose.model<IMedicalIncident>(
  'MedicalIncident',
  MedicalIncidentSchema,
);
