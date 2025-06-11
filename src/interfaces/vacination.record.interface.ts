import { Types } from "mongoose";

export interface IVaccinationResult {
    observedAt: Date;
    temperatureLevel: number;
    notes: string;
}

export interface IVaccinationRecord {
    consentId: Types.ObjectId;
    nurseId: Types.ObjectId;
    studentId: Types.ObjectId;
    vaccinationResultId: Types.ObjectId;
    administeredAt: Date;
    vaccineName: string;
    doseNumber: number;
    boosterInjectionDate: Date;
}