import { OrganizationEnum } from "@/enums/OrganizationEnum";
import { Types } from "mongoose";

export interface IPartnerStaff {
  fullName: string;
  position?: string;
  isActive: boolean;
  organizationId: Types.ObjectId
}

export interface IManagerInfo {
  fullName: string;
  email: string;
  phone: string;
  organizationId: Types.ObjectId; // Mỗi tổ chức chỉ nên có 1 manager
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