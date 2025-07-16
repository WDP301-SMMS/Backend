import { InventoryStatus, InventoryType } from '@/enums/InventoryEnums';
import {
  IMedicalInventory,
  IInventoryBatch,
} from '@/interfaces/medical.inventory.interface';

import mongoose, { Schema, Types } from 'mongoose';

const InventoryBatchSchema = new Schema<IInventoryBatch>(
  {
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    addedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: true },
);

const MedicalInventorySchema = new Schema<IMedicalInventory>(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    type: {
      // <-- THÊM TRƯỜNG NÀY
      type: String,
      required: true,
      enum: Object.values(InventoryType),
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    lowStockThreshold: {
      type: Number,
      required: true,
      min: [0, 'Low stock threshold cannot be negative'],
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(InventoryStatus),
      default: InventoryStatus.IN_STOCK,
    },
    batches: {
      type: [InventoryBatchSchema],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

MedicalInventorySchema.virtual('totalQuantity').get(function (
  this: IMedicalInventory,
) {
  return (this.batches || []).reduce(
    (total, batch) => total + batch.quantity,
    0,
  );
});

export const MedicalInventoryModel = mongoose.model<IMedicalInventory>(
  'MedicalInventory',
  MedicalInventorySchema,
);
