import { CampaignStatus } from '@/enums/CampaignEnum';
import { Types } from 'mongoose';

export interface IHealthCheckCampaign {
  templateId: Types.ObjectId;
  name: string;
  schoolYear: string;
  scheduleDate: Date;
  createdAt?: Date;
  createdBy: Types.ObjectId;
  participatingStaffs: String[];
  assignments: IAssignment[];
  status: CampaignStatus;
}

interface IAssignment {
  classId: Types.ObjectId;
  nurseId: Types.ObjectId;
}
