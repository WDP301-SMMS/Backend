import { IHealthProfile, IInjectedVaccine } from "@/interfaces/health.profile.interface";
import mongoose, { Schema } from "mongoose";

const HealthProfileSchema = new Schema<IHealthProfile>({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    allergies: {
        type: String,
        required: true
    },
    chronicConditions: {
        type: String,
        required: true
    },
    visionStatus: {
        type: String,
        required: true
    },
    hearingStatus: {
        type: String,
        required: true
    },
});

const InjectedVaccineSchema = new Schema<IInjectedVaccine>({
    vaccineName: {
        type: String,
        required: true
    },
    doseNumber: {
        type: Number,
        required: true
    },
});

export const HealthProfileModel = mongoose.model<IHealthProfile>("HealthProfile", HealthProfileSchema);
export const InjectedVaccineModel = mongoose.model<IInjectedVaccine>("InjectedVaccine", InjectedVaccineSchema);