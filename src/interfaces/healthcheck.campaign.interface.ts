import { CampaignStatus } from '@/enums/CampaignEnum';
import { Types } from 'mongoose';

export interface IHealthCheckCampaign {
  name: string;
  schoolYear: string;
  startDate: Date;
  endDate: Date;
  templateId: Types.ObjectId;
  targetGradeLevels: number[];
  nurseId?: Types.ObjectId;
  status: CampaignStatus;
  createdBy: Types.ObjectId;
}