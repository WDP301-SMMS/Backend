import { SlotEnum } from '@/enums/SlotEnum';
import { MedicationScheduleEnum } from '@/enums/MedicationEnum';
import { Types } from 'mongoose';

export interface IMedicationSchedule {
  medicationRequestId: Types.ObjectId;
  studentId: Types.ObjectId;
  createdByNurse: Types.ObjectId;
  updatedByNurse: Types.ObjectId;
  sessionSlots: SlotEnum;
  status: MedicationScheduleEnum;
  date: Date;
  reason?: string;
}
