import { StudentGender } from '@/enums/StudentEnum';
import { Types } from 'mongoose';

export interface IStudent {
  parentId: Types.ObjectId;
  classId: Types.ObjectId;
  invitedCode?: IInvitedCode;
  fullName: string;
  dateOfBirth: Date;
  gender: StudentGender;
  status: string;
}

export interface IInvitedCode {
  isActive: boolean;
  createdAt: Date;
}
