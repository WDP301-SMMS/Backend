import { Types } from "mongoose";


export interface IClass {
  className: string;
  gradeLevel?: number; // Optional, e.g., 1 for Grade 1
  schoolYear?: string; // Optional, e.g., "2024-2025"
  totalStudents: number;
  students: Types.ObjectId[]; // References to students in the users collection
}