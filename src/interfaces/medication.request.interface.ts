import { Types } from "mongoose";

export interface IMedicationRequest {
  parentId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  prescriptionFile: string;
  status: string;
}

export interface IRequestItem {
  medicationRequestId: Types.ObjectId;
  medicationName: string;
  dosage: string;
  instruction: string;
}