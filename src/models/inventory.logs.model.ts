import { InventoryLogType } from '@/enums/InventoryEnums';
import { IInventoryLog } from '@/interfaces/inventory.logs.interface';
import mongoose, { Schema } from 'mongoose';

const InventoryLogSchema = new Schema<IInventoryLog>({
  inventoryId: {
    type: Schema.Types.ObjectId,
    ref: 'MedicalInventory',
    required: true,
    index: true,
  },
  nurseId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  incidentId: {
    type: Schema.Types.ObjectId,
    ref: 'MedicalIncident',
    required: false,
    default: null,
    index: true,
  },
  typeLog: {
    type: String,
    required: true,
    enum: Object.values(InventoryLogType)
  },
  quantityChanged: { type: Number, required: true },
  reason: { type: String, required: true },
});

export const InventoryLogModel = mongoose.model<IInventoryLog>(
  'InventoryLog',
  InventoryLogSchema,
);
