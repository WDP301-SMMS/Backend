import { NextFunction, Request, Response } from 'express';
import { IMedicalInventory } from '@/interfaces/medical.inventory.interface';
import { IInventoryLog } from '@/interfaces/inventory.logs.interface';
import { InventoryLogType, InventoryType } from '@/enums/InventoryEnums';
import InventoryService from '@/services/inventory/inventory.service';
import { IUser } from '@/interfaces/user.interface';
import { IMedicalIncident } from '@/interfaces/medical.incident.interface';

declare global {
  namespace Express {
    export interface Request {
      user?: IUser;
    }
  }
}

class InventoryController {
  public inventoryService = new InventoryService();

  public stockInItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stockInData: {
        itemName: string;
        unit: string;
        type: InventoryType;
        description?: string;
        lowStockThreshold: number;
        quantity: number;
        expirationDate: Date;
      } = req.body;
      const managerId: string = req.user!._id!.toString();

      const resultItem = await this.inventoryService.stockInItem(stockInData, managerId);
      res.status(201).json({ data: resultItem, message: 'stockInSuccess' });
    } catch (error) {
      next(error);
    }
  };

  public getItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.query;
      const allItems: IMedicalInventory[] = await this.inventoryService.findAllItems(filters);
      res.status(200).json({ data: allItems, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getItemById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const itemId: string = req.params.id;
      const item: IMedicalInventory = await this.inventoryService.findItemById(itemId);
      res.status(200).json({ data: item, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public updateItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const itemId: string = req.params.id;
      const itemData: Partial<IMedicalInventory> = req.body;
      const updatedItem: IMedicalInventory = await this.inventoryService.updateItemInfo(itemId, itemData);
      res.status(200).json({ data: updatedItem, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public getIncidents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.query;
      const data: IMedicalIncident[] = await this.inventoryService.findIncidentsToDispense(filters);
      res.status(200).json({ data, message: 'findIncidents' });
    } catch (error) {
      next(error);
    }
  };

  public dispenseMedication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const incidentId: string = req.params.id;
      const dispenseData = req.body.dispensedItems;
      const nurseId = req.user!._id!.toString();

      const updatedIncident = await this.inventoryService.dispenseMedication(incidentId, dispenseData, nurseId);
      res.status(200).json({ data: updatedIncident, message: 'dispenseSuccess' });
    } catch (error) {
      next(error);
    }
  };
  
  public adjustStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adjustmentData: {
        itemId: string;
        batchId: string;
        newQuantity: number;
        reason: string;
        type: InventoryLogType.MANUAL_ADJUSTMENT | InventoryLogType.DISPOSE_EXPIRED;
      } = req.body;
      const managerId: string = req.user!._id!.toString();

      const log: IInventoryLog = await this.inventoryService.adjustStock(adjustmentData, managerId);
      res.status(201).json({ data: log, message: 'adjustmentSuccessful' });
    } catch (error) {
      next(error);
    }
  };

  public getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.query;
      const logs: IInventoryLog[] = await this.inventoryService.findLogs(filters);
      res.status(200).json({ data: logs, message: 'findLogs' });
    } catch (error) {
      next(error);
    }
  };

  public getDispenseHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.query;
      const historyData: any[] = await this.inventoryService.getDispenseHistory(filters);
      res.status(200).json({ data: historyData, message: 'findDispenseHistory' });
    } catch (error) {
      next(error);
    }
  };
}

export default InventoryController;