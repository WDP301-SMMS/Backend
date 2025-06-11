import { CampaignStatus, ExecutionType } from '@/enums/HealthCheckCampaignEnum';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';

export interface IHealthCheckCampaign {
  name: string;
  schoolYear: string;
  startDate: Date;
  endDate: Date;
  templateId: Types.ObjectId;
  targetGradeLevels: number[];
  executionType: ExecutionType;
  partnerId?: Types.ObjectId;
  status: CampaignStatus;
  createdBy: Types.ObjectId;
}