import { IMeetingSchedule } from '@/interfaces/meeting.schedule.interface';
import mongoose, { Schema } from 'mongoose';

const MeetingScheduleSchema = new Schema<IMeetingSchedule>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true,
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  //   resultId: { type: String, required: true, index: true }, HEALTH CHECK
  meetingTime: { type: Date, required: true },
  location: { type: String, required: true },
  status: { type: String, required: true },
  reasons: { type: String, required: true },
  notes: { type: String, required: true },
  afterMeetingNotes: { type: String, required: true },
});

export const MeetingScheduleModel = mongoose.model<IMeetingSchedule>(
  'MeetingSchedule',
  MeetingScheduleSchema,
);
