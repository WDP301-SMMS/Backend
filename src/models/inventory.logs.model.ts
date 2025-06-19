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
    index: true,
  },
  typeLog: { type: String, required: true },
  quantityChanged: { type: Number, required: true },
  reason: { type: String, required: true },
});

export const InventoryLogModel = mongoose.model<IInventoryLog>(
  'InventoryLog',
  InventoryLogSchema,
);
