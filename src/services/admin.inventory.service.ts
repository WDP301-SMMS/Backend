import { IMedicalInventory } from '@/interfaces/medical.inventory.interface';
import { MedicalInventoryModel } from '@/models/medical.inventory.model';
import { FilterQuery } from 'mongoose';

class AdminInventoryViewerService {
  private inventories = MedicalInventoryModel;

  /**
   * @description Lấy danh sách vật tư y tế trong kho (quyền xem của Admin).
   * @route GET /api/admin/inventory
   */
  public async getInventoryItemsForAdmin(query: {
    page?: string;
    limit?: string;
    search?: string;
    status?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'all';
  }): Promise<{ items: any[]; total: number; pages: number; currentPage: number }> {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const findQuery: FilterQuery<IMedicalInventory> = {};

    if (query.search) {
      findQuery.itemName = { $regex: query.search, $options: 'i' };
    }
    if (query.status && query.status !== 'all') {
      findQuery.status = query.status;
    }

    // Logic này gần như giống hệt hàm getInventoryItems của Nurse,
    // chỉ là nó được đặt trong một service riêng cho Admin.
    const aggregationPipeline: any[] = [
      { $match: findQuery },
      { $sort: { itemName: 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'inventorydetails',
          localField: 'detailId',
          foreignField: '_id',
          as: 'batchInfo',
        },
      },
      {
        $unwind: { path: '$batchInfo', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 1,
          itemName: 1,
          unit: 1,
          quantityTotal: 1,
          lowStockThreshold: 1,
          status: 1,
          expirationDate: '$batchInfo.expirationDate',
        },
      },
    ];

    const [items, total] = await Promise.all([
        this.inventories.aggregate(aggregationPipeline),
        this.inventories.countDocuments(findQuery),
    ]);
    
    return { items, total, pages: Math.ceil(total / limit), currentPage: page };
  }
}

export default AdminInventoryViewerService;