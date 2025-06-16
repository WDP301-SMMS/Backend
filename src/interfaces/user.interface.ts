import { RoleEnum } from '@/enums/RoleEnum';

export interface IUser extends Document {
  _id?: string;
  username?: string;
  password?: string;
  email: string;
  role: RoleEnum;
  dob?: Date;
  phone?: string;
  isActive: boolean;
  googleId?: string | null;
  authProvider: 'local' | 'google';
}