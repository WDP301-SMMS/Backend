import { IVaccinationRecord, IVaccinationResult } from "@/interfaces/vacination.record.interface";
import mongoose, { Schema } from "mongoose";


const ResultSchema = new Schema<IVaccinationResult>({
    observedAt: { type: Date, required: true },
    temperatureLevel: { type: Number, required: true },
    notes: { type: String, required: true },
});

const VaccinationRecordSchema = new Schema<IVaccinationRecord>({
    consentId: { type: Schema.Types.ObjectId, ref: 'Consent', required: true, index: true },
    nurseId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    vaccinationResultId: { type: Schema.Types.ObjectId, ref: 'VaccinationResult', required: true },
    administeredAt: { type: Date, required: true },
    vaccineName: { type: String, required: true },
    doseNumber: { type: Number, required: true },
    boosterInjectionDate: { type: Date, required: true },
});

export const VaccinationResultModel = mongoose.model<IVaccinationResult>("VaccinationResult", ResultSchema);
export const VaccinationRecordModel = mongoose.model<IVaccinationRecord>("VaccinationRecord", VaccinationRecordSchema);