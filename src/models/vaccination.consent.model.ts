import { IVaccinationConsent } from "@/interfaces/vaccination.consent.interface";
import mongoose, { Schema } from "mongoose";


const VaccinationConsentSchema: Schema = new Schema<IVaccinationConsent>({
    campaignId: { type: Schema.Types.ObjectId, ref: 'VaccinationCampaign', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export const VaccinationConsentModel = mongoose.model<IVaccinationConsent>("VaccinationConsent", VaccinationConsentSchema);