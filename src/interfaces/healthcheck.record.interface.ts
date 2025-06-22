import { Types } from 'mongoose';

export interface IHealthCheckRecord {
  resultId: Types.ObjectId;
  studentId: Types.ObjectId;
  latestResultId: Types.ObjectId;
  updatedAt: Date;
}
