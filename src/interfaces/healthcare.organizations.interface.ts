import { OrganizationEnum } from "@/enums/OrganizationEnum";

export interface IHealthcareOrganization {
  name: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  type: OrganizationEnum;
  isActive: boolean;
}