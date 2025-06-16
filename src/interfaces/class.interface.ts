import { Types } from "mongoose";


export interface IClass {
  className: string;
  gradeLevel?: number; 
  schoolYear?: string; 
  totalStudents: number;
  students: Types.Array<Types.ObjectId>; 
}