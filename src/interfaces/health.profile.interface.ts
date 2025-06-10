import { Types } from "mongoose";

export interface IHealthProfile {
  studentId: Types.ObjectId;
  allergies: string;
  chronicConditions: string;
  visionStatus: string;
  hearingStatus: string;
}

export interface IInjectedVaccine {
  vaccineName: string;
  doseNumber: number;
}