import { ConsentStatus } from "@/enums/ConsentsEnum";
import { Types } from "mongoose";


export interface IHealthCheckConsent {
  campaignId: Types.ObjectId;
  studentId: Types.ObjectId;
  parentId: Types.ObjectId;
  status: ConsentStatus;
  reasonForDeclining?: string | null;
  confirmedAt?: Date;
}