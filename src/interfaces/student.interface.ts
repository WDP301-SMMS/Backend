import { Types } from "mongoose";

export interface IStudent {
  parentId: Types.ObjectId;
  dateOfBirth: Date;
  classId: Types.ObjectId;
}