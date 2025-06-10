import { Types } from "mongoose";

export interface IInventoryLog {
  inventoryId: Types.ObjectId;
  nurseId: Types.ObjectId;
  incidentId: Types.ObjectId | null;
  typeLog: string;
  quantityChanged: number;
  reason: string;
}