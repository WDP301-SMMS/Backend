import { OrganizationEnum } from "@/enums/OrganizationEnum";
import { IHealthcareOrganization } from "@/interfaces/healthcare.organizations.interface";
import mongoose, { Schema } from "mongoose";

const HealthcareOrganizationSchema = new Schema<IHealthcareOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(OrganizationEnum), // Assuming OrganizationEnum is imported from enums
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
);

// Create and export the model
export const HealthcareOrganization = mongoose.model<IHealthcareOrganization>('HealthcareOrganization', HealthcareOrganizationSchema);
