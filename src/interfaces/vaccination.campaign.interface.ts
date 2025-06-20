import { CampaignStatus } from '@/enums/CampaignEnum';
import { Document, Types } from 'mongoose';

interface ISummary {
  totalStudents: number;
  totalConsents: number;
  approved: number;
  declined: number;
  administered: number;
}

export interface IVaccinationCampaign extends Document {
  name: string;
  vaccineName: string;
  doseNumber: number;
  description?: string; 
  schoolYear: string;
  partnerId: Types.ObjectId; 
  targetGradeLevels: number[];
  status: CampaignStatus;
  startDate: Date;
  endDate: Date;
  dispatchedAt?: Date;
  actualStartDate?: Date;
  completedAt?: Date;
  createdBy: Types.ObjectId;
  canceledBy?: Types.ObjectId;
  cancellationReason?: string;
  cancellationDate?: Date;
  summary: ISummary;
}