
import { Types } from 'mongoose';

export interface IHistoryEntry {
  date: Date;
  value: number;
}

export interface IVisionEntry {
  date: Date;
  leftEye: string;
  rightEye: string;
}

export interface IHealthDevelopmentTracker {
  studentId: Types.ObjectId;
  heightHistory: IHistoryEntry[];
  weightHistory: IHistoryEntry[];
  bmiHistory: IHistoryEntry[];
  visionHistory: IVisionEntry[];
  lastUpdatedAt: Date;
}