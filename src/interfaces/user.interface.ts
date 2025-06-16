import { RoleEnum } from "@/enums/RoleEnum";


export interface IUser {
  username: string;
  password?: string;
  email: string;
  role: RoleEnum;
  dob: Date;
  phone: string;
  isActive: boolean;
}
