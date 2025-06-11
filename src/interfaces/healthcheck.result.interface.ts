import { DataSource, ResultStatus } from "@/enums/HealthCheckResultEnum";
import { Types } from "mongoose";


export interface IResultData {
  itemName: string;
  value: any; // Flexible type to accommodate NUMBER, TEXT, BOOLEAN, or SELECT
  unit?: string | null;
  isAbnormal: boolean;
  notes?: string;
}

export interface IHealthCheckResult {
  campaignId: Types.ObjectId;
  studentId: Types.ObjectId;
  checkupDate: Date;
  resultsData: IResultData[];
  overallConclusion?: string;
  recommendation?: string;
  checkedBy: Types.ObjectId;
  dataSource: DataSource;
  status: ResultStatus;
}