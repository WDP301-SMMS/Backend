import { IncidentSeverity } from '@/enums/IncidentEnum';
import { Types } from 'mongoose';

export interface IMedicalIncident {
  studentId: Types.ObjectId;
  nurseId: Types.ObjectId;
  incidentType: string;
  description: string;
  severity: IncidentSeverity;
  actionsTaken: string;
  note?: string;
  incidentTime: Date;
}
