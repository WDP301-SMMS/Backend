import { CampaignStatus } from '@/enums/CampaignEnum';
import { Types } from 'mongoose';

export interface IHealthCheckCampaign {
  templateId: Types.ObjectId;
  name?: string;
  schoolYear?: string;
  startDate?: Date;
  endDate?: Date | null;
  actualStartDate?: Date | null;
  completedDate?: Date | null;
  createdAt?: Date | null;
  createdBy?: Types.ObjectId;
  participatingStaffs?: String[];
  assignments?: IAssignment[];
  status?: CampaignStatus;
}

interface IAssignment {
  classId: Types.ObjectId;
  nurseId: Types.ObjectId;
}

// Query interfaces for sorting, filtering, and searching
export interface IHealthCheckCampaignQuery {
  search?: string;
  status?: CampaignStatus | CampaignStatus[];
  schoolYear?: string | string[];
  startDate?: {
    from?: Date;
    to?: Date;
  };
  endDate?: {
    from?: Date;
    to?: Date;
  };
  createdBy?: Types.ObjectId | Types.ObjectId[];
  participatingStaff?: Types.ObjectId;
  sortBy?: CampaignSortField;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export type CampaignSortField = 
  | 'name'
  | 'startDate'
  | 'endDate'
  | 'createdAt'
  | 'status'
  | 'schoolYear'
  | 'completedDate'
  | 'actualStartDate';

export interface ICampaignFilterOptions {
  search?: string;
  status?: CampaignStatus[];
  schoolYear?: string[];
  dateRange?: {
    field: 'startDate' | 'endDate' | 'createdAt' | 'completedDate' | 'actualStartDate';
    from?: Date;
    to?: Date;
  };
  createdBy?: Types.ObjectId[];
  participatingStaff?: Types.ObjectId;
}
