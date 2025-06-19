import {
  IHealthcareOrganization,
  IManagerInfo,
  IPartnerStaff,
} from '@/interfaces/healthcare.organizations.interface';
import { OrganizationEnum } from '@/enums/OrganizationEnum';
import mongoose, { Schema } from 'mongoose';

const PartnerStaffSchema = new Schema<IPartnerStaff>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: false,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'HealthcareOrganization',
      required: true,
      index: true,
    },
  },
  { timestamps: true, collection: 'OrganizationStaff' },
);

const ManagerInfoSchema = new Schema<IManagerInfo>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'HealthcareOrganization',
      required: true,
      unique: true, // Mỗi tổ chức chỉ nên có 1 manager -> đảm bảo không có 2 manager cùng trỏ về 1 organization
      index: true,
    },
  },
  { timestamps: true, collection: 'OrganizationManager' },
);

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
      enum: Object.values(OrganizationEnum),
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    managerInfo: {
      type: Schema.Types.ObjectId,
      ref: 'OrganizationManager',
      required: true,
    },
    staffMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'OrganizationStaff',
      },
    ],
  },
  {
    timestamps: true,
    collection: 'HealthcareOrganization',
  },
);

export const HealthcareOrganization = mongoose.model<IHealthcareOrganization>(
  'HealthcareOrganization',
  HealthcareOrganizationSchema,
);
export const OrganizationManager = mongoose.model<IManagerInfo>(
  'OrganizationManager',
  ManagerInfoSchema,
);
export const OrganizationStaffs = mongoose.model<IPartnerStaff>(
  'OrganizationStaff',
  PartnerStaffSchema,
);
