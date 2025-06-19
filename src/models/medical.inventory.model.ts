import {
  IInventoryDetail,
  IMedicalInventory,
} from '@/interfaces/medical.inventory.interface';
import mongoose, { Schema } from 'mongoose';

const MedicalInventorySchema: Schema = new Schema<IMedicalInventory>(
  {
    detailId: {
      type: Schema.Types.ObjectId,
      ref: 'InventoryDetail',
      required: true,
      index: true,
    }, // Foreign key, indexed for lookups
    itemName: { type: String, required: true },
    unit: { type: String, required: true },
    quantityTotal: { type: Number, required: true },
    lowStockThreshold: { type: Number, required: true },
    status: { type: String, required: true },
  },
  { collection: 'MedicalInventory' },
);

export const MedicalInventoryModel = mongoose.model<IMedicalInventory>(
  'MedicalInventory',
  MedicalInventorySchema,
);

const InventoryDetailSchema: Schema = new Schema<IInventoryDetail>(
  {
    quantity: { type: Number, required: true },
    expirationDate: { type: Date, required: true },
  },
  { collection: 'InventoryDetail' },
);

export const InventoryDetailModel = mongoose.model<IInventoryDetail>(
  'InventoryDetail',
  InventoryDetailSchema,
);
