import { Router } from 'express';
import InventoryController from '@/controllers/inventory/inventory.controller';
import {
  stockInItemValidator,
  updateItemValidator,
  dispenseMedicationValidator,
  adjustStockValidator,
  addBatchValidator,
} from '@/validators/inventory/inventory.validator';

const router = Router();
const inventoryController = new InventoryController();

// --- API NHẬP/XUẤT/QUẢN LÝ KHO ---
router.post(
  '/stock-in',
  stockInItemValidator,
  inventoryController.stockInItem,
);

router.get(
  '/items',
  inventoryController.getItems,
);

router.get(
  '/items/:id',
  inventoryController.getItemById,
);

router.patch(
  '/items/:id',
  updateItemValidator,
  inventoryController.updateItem,
);

router.patch(
  '/adjustment',
  adjustStockValidator,
  inventoryController.adjustStock,
);


router.post(
  '/items/:itemId/batches', 
  addBatchValidator,        
  inventoryController.addBatchToItem,
);

// --- API LIÊN QUAN ĐẾN CẤP PHÁT CHO SỰ CỐ ---
router.get(
  '/incidents-to-dispense',
  inventoryController.getIncidents,
);

router.post(
  '/incidents/:id/dispense',
  dispenseMedicationValidator,
  inventoryController.dispenseMedication,
);

// --- API BÁO CÁO & LỊCH SỬ ---
router.get(
  '/logs',
  inventoryController.getLogs,
);

router.get(
  '/dispense-history',
  inventoryController.getDispenseHistory,
);

export default router;