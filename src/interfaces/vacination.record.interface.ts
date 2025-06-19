import { Types } from "mongoose";

export interface IVaccinationResult {
  observedAt: Date;
  temperatureLevel: number;
  notes: string;
}

export interface IVaccinationRecord {
    consentId: Types.ObjectId; 
    partnerId: Types.ObjectId; 
    administeredByStaffId: Types.ObjectId;
    studentId: Types.ObjectId; 
    postVaccinationChecks: IVaccinationResult[];
    administeredAt: Date;
    vaccineName: string;
    doseNumber: number;
    boosterInjectionDate?: Date; 
}