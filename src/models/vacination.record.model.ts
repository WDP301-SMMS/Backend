import { IVaccinationRecord, IVaccinationResult } from "@/interfaces/vacination.record.interface";
import mongoose, { Schema } from "mongoose";

const VaccinationResultSchema = new Schema<IVaccinationResult>({
    observedAt: { 
        type: Date, 
        required: true 
    },
    temperatureLevel: { 
        type: Number, 
        required: true 
    },
    notes: { 
        type: String, 
        required: true,
        trim: true
    },
}, { _id: false });

const VaccinationRecordSchema = new Schema<IVaccinationRecord>(
  {
    consentId: { 
        type: Schema.Types.ObjectId, 
        ref: 'VaccinationConsent', 
        required: true, 
        index: true 
    },
    partnerId: { 
        type: Schema.Types.ObjectId, 
        ref: 'HealthcareOrganization', 
        required: true, 
        index: true 
    },
    administeredByStaffId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    studentId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Student', 
        required: true, 
        index: true 
    },
    postVaccinationChecks: {
        type: [VaccinationResultSchema],
        default: []
    },
    administeredAt: { 
        type: Date, 
        required: true 
    },
    vaccineName: { 
        type: String, 
        required: true,
        trim: true
    },
    doseNumber: { 
        type: Number, 
        required: true 
    },
    boosterInjectionDate: { 
        type: Date, 
        required: false 
    },
  },
  {
    timestamps: true,
    collection: 'VaccinationRecord'
  }
);

// export const VaccinationResultModel = mongoose.model<IVaccinationResult>("VaccinationResult", VaccinationResultSchema);
export const VaccinationRecordModel = mongoose.model<IVaccinationRecord>("VaccinationRecord", VaccinationRecordSchema);