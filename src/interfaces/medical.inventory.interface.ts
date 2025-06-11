import { Types } from "mongoose";

export interface IMedicalInventory {
  detailId: Types.ObjectId;
  itemName: string;
  unit: string;
  quantityTotal: number;
  lowStockThreshold: number;
  status: string;
}

export interface IInventoryDetail {
  quantity: number;
  expirationDate: Date;
}