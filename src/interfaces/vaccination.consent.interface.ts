import { ConsentStatus } from "@/enums/ConsentsEnum";
import { Types } from "mongoose";

export interface IVaccinationConsent extends Document{
  campaignId: Types.ObjectId;
  studentId: Types.ObjectId;
  parentId: Types.ObjectId;
  status: ConsentStatus;
  reasonForDeclining?: string;
  confirmedAt?: Date;
  createdAt: Date;
}