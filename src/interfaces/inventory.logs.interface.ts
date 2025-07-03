import { InventoryLogType } from "@/enums/InventoryEnums";
import { Types } from "mongoose";

export interface IInventoryLog {
  inventoryId: Types.ObjectId;
  nurseId: Types.ObjectId;
  incidentId: Types.ObjectId | null;
  typeLog: InventoryLogType;
  quantityChanged: number;
  reason: string;
}