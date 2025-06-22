import { Types } from 'mongoose';
import { MedicationRequestEnum } from '@/enums/MedicationEnum';

export interface IMedicationRequest {
  parentId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  prescriptionFile: string;
  status: MedicationRequestEnum;
}

export interface IRequestItem {
  medicationRequestId: Types.ObjectId;
  medicationName: string;
  dosage: string;
  instruction: string;
}
