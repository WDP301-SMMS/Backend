import { Types } from "mongoose";

export interface IVaccinationConsent {
  campaignId: Types.ObjectId;
  studentId: Types.ObjectId;
  parentId: Types.ObjectId;
  status: string;
  createdAt: Date;
}