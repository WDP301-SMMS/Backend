import { OrganizationEnum } from "@/enums/OrganizationEnum";
import { Types } from "mongoose";

export interface IPartnerStaff {
  fullName: string;
  position?: string;
  isActive: boolean;
}

export interface IManagerInfo {
  fullName: string;
  email: string;
  phone: string;
}

export interface IHealthcareOrganization {
  name: string;
  address: string;
  phone: string;
  email: string;
  type: OrganizationEnum;
  isActive: boolean;
  managerInfo: Types.ObjectId | IManagerInfo;
  staffMembers: (Types.ObjectId | IPartnerStaff)[];
}