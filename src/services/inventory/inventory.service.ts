import {
  InventoryLogType,
  InventoryStatus,
  InventoryType,
} from '@/enums/InventoryEnums';
import { IInventoryLog } from '@/interfaces/inventory.logs.interface';
import {
  IMedicalInventory,
  IInventoryBatch,
} from '@/interfaces/medical.inventory.interface';
import { InventoryLogModel } from '@/models/inventory.logs.model';
import { MedicalInventoryModel } from '@/models/medical.inventory.model';
import { MedicalIncidentModel } from '@/models/medical.incident.model'; // <-- Thêm import này
import { IMedicalIncident } from '@/interfaces/medical.incident.interface'; // <-- Thêm import này
import { AppError } from '@/utils/globalErrorHandler';
import mongoose, { FilterQuery } from 'mongoose';

const createError = (status: number, message: string): AppError => {
  const error: AppError = new Error(message);
  error.status = status;
  return error;
};

class InventoryService {
  public inventory = MedicalInventoryModel;
  public logs = InventoryLogModel;
  public incidents = MedicalIncidentModel; // <-- Thêm property này

  public async stockInItem(
    stockInData: {
      itemName: string;
      unit: string;
      type: InventoryType;
      description?: string;
      lowStockThreshold: number;
      quantity: number;
      expirationDate: Date;
    },
    managerId: string,
  ): Promise<IMedicalInventory> {
    const {
      itemName,
      unit,
      type,
      description,
      lowStockThreshold,
      quantity,
      expirationDate,
    } = stockInData;

    if (quantity <= 0) {
      throw createError(400, 'Quantity must be positive');
    }

    let item = await this.inventory.findOne({ itemName: itemName.trim() });

    if (!item) {
      item = await this.inventory.create({
        itemName,
        unit,
        type,
        description,
        lowStockThreshold,
        status: InventoryStatus.OUT_OF_STOCK,
        batches: [],
      });
    }

    item.batches.push({ quantity, expirationDate, addedAt: new Date() });
    this._updateItemStatus(item);
    await item.save();

    await this.logs.create({
      inventoryId: item._id,
      nurseId: managerId,
      typeLog: InventoryLogType.ADD_STOCK,
      quantityChanged: quantity,
      reason: `Stock-in: Added new batch, expiration: ${expirationDate.toISOString().split('T')[0]}`,
    });

    return item;
  }

  public async withdrawItemForIncident(
    withdrawalData: {
      itemId: string;
      quantityToWithdraw: number;
      incidentId?: string;
      usageInstructions?: string;
    },
    nurseId: string,
  ): Promise<IInventoryLog> {
    const { itemId, quantityToWithdraw, incidentId, usageInstructions } =
      withdrawalData;

    if (quantityToWithdraw <= 0) {
      throw createError(400, 'Quantity to withdraw must be positive');
    }

    const item = await this.findAndValidateItemForWithdrawal(
      itemId,
      quantityToWithdraw,
    );
    item.batches.sort(
      (a, b) => a.expirationDate.getTime() - b.expirationDate.getTime(),
    );

    let remainingToWithdraw = quantityToWithdraw;
    for (const batch of item.batches) {
      if (remainingToWithdraw === 0) break;
      const amountToTakeFromBatch = Math.min(
        remainingToWithdraw,
        batch.quantity,
      );
      batch.quantity -= amountToTakeFromBatch;
      remainingToWithdraw -= amountToTakeFromBatch;
    }

    item.batches = item.batches.filter((batch) => batch.quantity > 0);
    this._updateItemStatus(item);
    await item.save();

    const log = await this.logs.create([
      {
        inventoryId: item._id,
        nurseId,
        incidentId: incidentId || null,
        typeLog: InventoryLogType.WITHDRAWAL_FOR_INCIDENT,
        quantityChanged: -quantityToWithdraw,
        reason: incidentId ? `Withdrawal for incident` : 'General withdrawal',
        usageInstructions: usageInstructions || null,
      },
    ]);

    return log[0];
  }

  public async findIncidentsToDispense(
    filters: FilterQuery<IMedicalIncident>,
  ): Promise<IMedicalIncident[]> {
    const incidents = await this.incidents
      .find(filters)
      .populate('studentId', 'fullName')
      .sort({ incidentTime: -1 });
    return incidents;
  }

  public async dispenseMedication(
    incidentId: string,
    dispenseData: {
      itemId: string;
      quantityToWithdraw: number;
      usageInstructions?: string;
    }[],
    nurseId: string,
  ): Promise<IMedicalIncident> {
    try {
      const incident = await this.incidents.findById(incidentId);
      if (!incident) {
        throw createError(404, 'Incident not found');
      }

      for (const itemToDispense of dispenseData) {
        await this.withdrawItemForIncident(
          {
            ...itemToDispense,
            incidentId: incident._id.toString(),
          },
          nurseId,
        );
      }

      await incident.save();
      return incident;
    } catch (error) {
      throw error;
    }
  }

  public async findAllItems(
    filters: FilterQuery<IMedicalInventory>,
  ): Promise<IMedicalInventory[]> {
    const items = await this.inventory.find(filters).sort({ itemName: 1 });
    return items;
  }

  public async findItemById(itemId: string): Promise<IMedicalInventory> {
    if (!itemId) {
      throw createError(400, 'Item ID cannot be empty');
    }
    const item = await this.inventory.findById(itemId);
    if (!item) {
      throw createError(404, "Item doesn't exist");
    }
    return item;
  }

  public async updateItemInfo(
    itemId: string,
    itemData: Partial<
      Pick<
        IMedicalInventory,
        | 'itemName'
        | 'unit'
        | 'lowStockThreshold'
        | 'description'
        | 'type'
        | 'status'
      >
    >,
  ): Promise<IMedicalInventory> {
    if (!itemData || Object.keys(itemData).length === 0) {
      throw createError(400, 'Item data cannot be empty');
    }
    const updatedItem = await this.inventory.findByIdAndUpdate(
      itemId,
      itemData,
      { new: true },
    );
    if (!updatedItem) {
      throw createError(404, "Item doesn't exist");
    }
    return updatedItem;
  }

  public async adjustStock(
    adjustmentData: {
      itemId: string;
      batchId: string;
      newQuantity: number;
      reason: string;
      type:
        | InventoryLogType.MANUAL_ADJUSTMENT
        | InventoryLogType.DISPOSE_EXPIRED;
    },
    managerId: string,
  ): Promise<IInventoryLog> {
    const { itemId, batchId, newQuantity, reason, type } = adjustmentData;
    if (newQuantity < 0)
      throw createError(400, 'New quantity cannot be negative.');

    const item = await this.inventory.findById(itemId);
    if (!item) throw createError(404, "Item doesn't exist");

    const batch = item.batches.find((b) => b._id?.toString() === batchId);
    if (!batch) throw createError(404, 'Batch not found in this item');

    const quantityChanged = newQuantity - batch.quantity;
    if (quantityChanged === 0)
      throw createError(400, 'No change in quantity detected.');

    batch.quantity = newQuantity;
    if (batch.quantity === 0) {
      item.batches = item.batches.filter((b) => b._id?.toString() !== batchId);
    }
    this._updateItemStatus(item);
    await item.save();

    const log = await this.logs.create({
      inventoryId: item._id,
      nurseId: managerId,
      typeLog: type,
      quantityChanged,
      reason,
    });
    return log;
  }

  public async findLogs(
    filters: FilterQuery<IInventoryLog>,
  ): Promise<IInventoryLog[]> {
    const logs = await this.logs
      .find(filters)
      .populate('inventoryId', 'itemName unit batches')
      .populate('nurseId', 'username email')
      .sort({ createdAt: -1 });
    return logs;
  }

  public async getDispenseHistory(filters: any): Promise<any[]> {
    const pipeline: any[] = [
      {
        $match: {
          typeLog: InventoryLogType.WITHDRAWAL_FOR_INCIDENT,
          incidentId: { $ne: null },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'medicalinventories',
          localField: 'inventoryId',
          foreignField: '_id',
          as: 'itemInfo',
        },
      },
      { $unwind: '$itemInfo' },
      {
        $group: {
          _id: '$incidentId',
          dispensedItems: {
            $push: {
              itemName: '$itemInfo.itemName',
              quantity: { $abs: '$quantityChanged' },
              unit: '$itemInfo.unit',
              usageInstructions: '$usageInstructions',
            },
          },
          dispensedAt: { $first: '$createdAt' },
        },
      },
      {
        $lookup: {
          from: 'medicalincidents',
          localField: '_id',
          foreignField: '_id',
          as: 'incidentInfo',
        },
      },
      { $unwind: '$incidentInfo' },
      {
        $lookup: {
          from: 'students',
          localField: 'incidentInfo.studentId',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      { $unwind: '$studentInfo' },
      {
        $lookup: {
          from: 'classes',
          localField: 'studentInfo.classId',
          foreignField: '_id',
          as: 'classInfo',
        },
      },
      { $unwind: '$classInfo' },
      {
        $project: {
          _id: 0,
          incidentId: '$_id',
          incidentType: '$incidentInfo.incidentType',
          incidentDescription: '$incidentInfo.description',
          incidentTime: '$incidentInfo.incidentTime',
          studentName: '$studentInfo.fullName',
          studentClassName: '$classInfo.className',
          dispensedItems: '$dispensedItems',
          dispensedAt: '$dispensedAt',
        },
      },
    ];
    const matchStage: { [key: string]: any } = {};
    if (filters.studentId)
      matchStage['incidentInfo.studentId'] = new mongoose.Types.ObjectId(
        filters.studentId,
      );
    if (filters.classId)
      matchStage['studentInfo.classId'] = new mongoose.Types.ObjectId(
        filters.classId,
      );
    if (Object.keys(matchStage).length > 0)
      pipeline.splice(5, 0, { $match: matchStage });
    return this.logs.aggregate(pipeline);
  }

  public async addBatch(
    itemId: string,
    batchData: { quantity: number; expirationDate: Date },
    managerId: string,
  ): Promise<IMedicalInventory> {
    const item = await this.inventory.findById(itemId);
    if (!item) {
      throw createError(404, 'Item not found');
    }
    item.batches.push({
      quantity: batchData.quantity,
      expirationDate: batchData.expirationDate,
      addedAt: new Date(),
    });

    this._updateItemStatus(item);
    await item.save();
    await this.logs.create({
      inventoryId: item._id,
      nurseId: managerId,
      typeLog: InventoryLogType.ADD_STOCK,
      quantityChanged: batchData.quantity,
      reason: `Stock-in: Added new batch for existing item. Expiration: ${batchData.expirationDate.toISOString().split('T')[0]}`,
    });

    return item;
  }

  private _updateItemStatus(item: IMedicalInventory): void {
    if (item.status === InventoryStatus.DISCONTINUED) return;
    const totalQuantity = item.batches.reduce(
      (sum, batch) => sum + batch.quantity,
      0,
    );
    if (totalQuantity === 0) item.status = InventoryStatus.OUT_OF_STOCK;
    else if (totalQuantity <= item.lowStockThreshold)
      item.status = InventoryStatus.LOW_STOCK;
    else item.status = InventoryStatus.IN_STOCK;
  }

  private async findAndValidateItemForWithdrawal(
    itemId: string,
    quantityToWithdraw: number,
  ): Promise<IMedicalInventory> {
    const item = await this.inventory.findById(itemId);
    if (!item) throw createError(404, "Item doesn't exist");
    const totalQuantity = item.batches.reduce(
      (sum, batch) => sum + batch.quantity,
      0,
    );
    if (totalQuantity < quantityToWithdraw)
      throw createError(
        400,
        `Insufficient stock for ${item.itemName}. Available: ${totalQuantity}`,
      );
    return item;
  }
}

export default InventoryService;
