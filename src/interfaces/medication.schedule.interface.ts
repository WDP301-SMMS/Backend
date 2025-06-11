import { SlotEnum } from "@/enums/SlotEnum";
import { Types } from "mongoose";

export interface IMedicationSchedule {
  medicationRequestId: Types.ObjectId;
  studentId: Types.ObjectId;
  nurseId: Types.ObjectId;
  sessionSlots: SlotEnum;
  status: string;
}