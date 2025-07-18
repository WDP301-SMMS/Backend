import { Types } from 'mongoose';

export interface IResultData {
  itemName: string;
  value: any;
  unit?: string | null;
  isAbnormal: boolean;
  notes?: string;
  guideline?: string;
}

export interface IHealthCheckResult {
  campaignId: Types.ObjectId;
  nurseId: Types.ObjectId;
  studentId: Types.ObjectId;
  checkupDate: Date;
  isAbnormal: boolean;
  recommendations?: string;
  overallConclusion?: string;
  resultsData: IResultData[];
}
