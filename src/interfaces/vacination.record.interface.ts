import { Types } from "mongoose";
import { Document } from "mongoose"; 


export interface IObservation {
  observedAt: Date;
  temperatureLevel: number;
  notes?: string; 
  isAbnormal: boolean;
  actionsTaken?: string; 
}


export interface IVaccinationRecord extends Document {
    consentId: Types.ObjectId; 
    partnerId: Types.ObjectId; 
    administeredByStaffId: Types.ObjectId; 
    studentId: Types.ObjectId; 
    postVaccinationChecks: IObservation[]; 
    administeredAt: Date;
    vaccineName: string;
    doseNumber: number;
    boosterInjectionDate?: Date; 
}


export interface IPopulatedVaccinationRecord extends IVaccinationRecord {
  consentId: any; 
  partnerId: any; 
  administeredByStaffId: any; 
  studentId: any; 
}