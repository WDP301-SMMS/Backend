import { InventoryType } from '@/enums/InventoryEnums';
import { Document, Types } from 'mongoose';

export interface IInventoryBatch {
  _id?: Types.ObjectId;
  quantity: number;
  expirationDate: Date;
  addedAt: Date;
}

export interface IMedicalInventory extends Document {
  itemName: string;
  description?: string;
  type: InventoryType;
  unit: string;
  lowStockThreshold: number;
  status: string;
  batches: IInventoryBatch[];
}