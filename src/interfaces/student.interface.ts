import { StudentGender, StudentStatus } from '@/enums/StudentEnum';
import { Types } from 'mongoose';

export interface IStudent {
  parentId?: Types.ObjectId;
  classId: Types.ObjectId;
  invitedCode?: IInvitedCode;
  fullName: string;
  dateOfBirth: Date;
  gender: StudentGender;
  status: StudentStatus;
}

export interface IInvitedCode {
  code: string;
  isActive: boolean;
  createdAt: Date;
}
