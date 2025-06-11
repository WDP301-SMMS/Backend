import { Types } from "mongoose";

export interface IMeetingSchedule {
  studentId: Types.ObjectId;
  parentId: Types.ObjectId;
  resultId: Types.ObjectId;
  meetingTime: Date;
  location: string;
  status: string;
  reasons: string;
  notes: string;
  afterMeetingNotes: string;
}