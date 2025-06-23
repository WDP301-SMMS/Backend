import { EAllergySeverity } from "@/enums/AllergyEnums";
import { Types } from "mongoose";

export interface IAllergy {
  type: string; 
  reaction: string; 
  severity: EAllergySeverity; // Enum for severity: Mild, Medium, Severe, Life-threatening
  notes: string;
}

export interface IChronicCondition {
  conditionName: string;
  diagnosedDate?: Date;
  medication: string;
  notes: string;
}

export interface IMedicalHistoryEvent {
  condition: string;
  facility: string;
  treatmentDate: Date;
  method: string;
  notes?: string;
}

export interface IVisionCheckup {
  checkupDate: Date; 
  rightEyeVision: string;
  leftEyeVision: string;
  wearsGlasses: boolean;
  isColorblind: boolean;
  notes?: string;
}

export interface IHearingCheckup {
  checkupDate: Date; 
  rightEarStatus: string;
  leftEarStatus: string;
  usesHearingAid: boolean;
  notes?: string; 
}



export interface IInjectedVaccine {
  vaccineName: string;
  doseNumber: number;
  note: string;
  dateInjected: Date;
  locationInjected: string;
}

// MAIN
export interface IHealthProfile {
  studentId: Types.ObjectId;
  allergies: IAllergy[];
  chronicConditions: IChronicCondition[];
  medicalHistory: IMedicalHistoryEvent[];
  visionHistory: IVisionCheckup[];
  hearingHistory: IHearingCheckup[];
  vaccines: IInjectedVaccine[];
}