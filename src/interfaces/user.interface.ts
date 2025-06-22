import { RoleEnum } from '@/enums/RoleEnum';
import { StudentGender } from '@/enums/StudentEnum';

export interface IUser extends Document {
  _id?: string;
  username?: string;
  password?: string;
  email: string;
  role: RoleEnum;
  dob?: Date;
  gender?: StudentGender;
  phone?: string;
  isActive: boolean;
  googleId?: string | null;
  authProvider: 'local' | 'google';
}