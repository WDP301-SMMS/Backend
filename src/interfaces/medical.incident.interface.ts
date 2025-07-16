import { Types } from 'mongoose';

export interface IMedicalIncident {
  studentId: Types.ObjectId;
  nurseId: Types.ObjectId;
  incidentType: string;
  description: string;
  severity: string;
  status: string;
  actionsTaken: string;
  note?: string;
  incidentTime: Date;
}
