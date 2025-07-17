import { AppointmentStatus } from '@/enums/AppointmentEnums';
import { IMeetingSchedule } from '@/interfaces/meeting.schedule.interface';
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema<IMeetingSchedule>({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthCheckResult',
    required: false,
  },
  meetingTime: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(AppointmentStatus),
    default: AppointmentStatus.SCHEDULED,
  },
  notes: {
    type: String,
    required: false,
  },
  afterMeetingNotes: {
    type: String,
    required: false,
  },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
