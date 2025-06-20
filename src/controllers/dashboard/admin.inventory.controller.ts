import AdminInventoryViewerService from '@/services/admin/admin.inventory.service';
import { NextFunction, Request, Response } from 'express';


const adminInventoryViewerService = new AdminInventoryViewerService();
const getInventoryForAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = req.query as {
      page?: string;
      limit?: string;
      search?: string;
      status?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'all';
    };

    const result = await adminInventoryViewerService.getInventoryItemsForAdmin(query);
    res.status(200).json({ data: result, message: 'Inventory items retrieved successfully' });
  } catch (error) {
    next(error);
  }
};

export const AdminInventoryViewerController = {
  getInventoryForAdmin,
};