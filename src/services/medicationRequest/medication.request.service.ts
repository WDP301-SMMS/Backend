import {
  MedicationRequestModel,
  RequestItemModel,
} from '@/models/medication.request.model';
import { MedicationScheduleModel } from '@/models/medication.schedule.model';
import {
  MedicationRequestEnum,
  MedicationScheduleEnum,
} from '@/enums/MedicationEnum';
import { AppError } from '@/utils/globalErrorHandler';
import {
  IMedicationRequest,
  IRequestItem,
} from '@/interfaces/medication.request.interface';

const createAppError = (status: number, message: string): AppError => {
  const error: AppError = new Error(message);
  error.status = status;
  return error;
};

class MedicationRequestService {
  public async createRequest(data: any) {
    const request = await MedicationRequestModel.create({
      ...data,
    });

    const items = await RequestItemModel.insertMany(
      data.items.map((item: any) => ({
        ...item,
        medicationRequestId: request._id,
      })),
    );

    return { request, items };
  }

  public async getAllRequest(query: {
    page?: number;
    limit?: number;
    status?: string;
    parentId?: string;
    studentId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const {
      page = 1,
      limit = 10,
      status,
      parentId,
      studentId,
      startDate,
      endDate,
    } = query;

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (parentId) filter.parentId = parentId;
    if (studentId) filter.studentId = studentId;
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    const total = await MedicationRequestModel.countDocuments(filter);
    const requests = await MedicationRequestModel.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ startDate: -1 })
      .populate({ path: 'parentId', select: 'username' })
      .populate({ path: 'studentId', select: 'fullName' });

    const resultWithItems = await Promise.all(
      requests.map(async (request) => {
        const requestItems = await RequestItemModel.find({
          medicationRequestId: request._id,
        });

        return {
          ...request.toObject(),
          requestItems,
        };
      }),
    );

    return {
      data: resultWithItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async getRequestById(id: string) {
    const request = await MedicationRequestModel.findById(id)
      .populate({
        path: 'parentId',
        select: 'username',
      })
      .populate({
        path: 'studentId',
        select: 'fullName',
      });
    if (!request) throw createAppError(404, 'Không tìm thấy yêu cầu nào.');

    const requestItems = await RequestItemModel.find({
      medicationRequestId: request._id,
    });

    return {
      ...request.toObject(),
      requestItems,
    };
  }

  public async getRequestByParentId(
    parentId: string,
    query: {
      page?: number;
      limit?: number;
      status?: string;
      studentId?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const {
      page = 1,
      limit = 10,
      status,
      studentId,
      startDate,
      endDate,
    } = query;

    const filter: Record<string, any> = { parentId };
    if (status) filter.status = status;
    if (studentId) filter.studentId = studentId;
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    const total = await MedicationRequestModel.countDocuments(filter);
    const requests = await MedicationRequestModel.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ startDate: -1 })
      .populate({ path: 'parentId', select: 'username' })
      .populate({ path: 'studentId', select: 'fullName' });

    const resultWithItems = await Promise.all(
      requests.map(async (request) => {
        const requestItems = await RequestItemModel.find({
          medicationRequestId: request._id,
        });

        return {
          ...request.toObject(),
          requestItems,
        };
      }),
    );

    return {
      data: resultWithItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async updateRequestById(
    id: string,
    updateData: Partial<IMedicationRequest>,
  ) {
    const { startDate, endDate, prescriptionFile, status } = updateData;

    const updateFields: Partial<IMedicationRequest> = {};
    if (startDate) updateFields.startDate = startDate;
    if (endDate) updateFields.endDate = endDate;
    if (prescriptionFile) updateFields.prescriptionFile = prescriptionFile;
    if (status) updateFields.status = status;

    const updatedRequest = await MedicationRequestModel.findByIdAndUpdate(
      id,
      updateFields,
      { new: true },
    );

    if (!updatedRequest) {
      throw createAppError(404, 'Không tìm thấy yêu cầu nào.');
    }

    // 👉 Nếu trạng thái cập nhật là "Cancelled", cập nhật luôn các schedule liên quan
    if (status === MedicationRequestEnum.Cancelled) {
      await MedicationScheduleModel.updateMany(
        {
          medicationRequestId: updatedRequest._id,
          status: MedicationScheduleEnum.Pending,
        },
        { $set: { status: MedicationScheduleEnum.Cancelled } },
      );
    }

    return updatedRequest;
  }

  public async updateRequestItems(
    requestId: string,
    items: {
      _id?: string;
      medicationName: string;
      dosage: string;
      instruction: string;
    }[],
  ) {
    const request = await MedicationRequestModel.findById(requestId);
    if (!request) throw createAppError(404, 'Không tìm thấy yêu cầu.');

    const updatedItems: IRequestItem[] = [];

    for (const item of items) {
      if (item._id) {
        // Cập nhật item cũ
        const updated = await RequestItemModel.findOneAndUpdate(
          { _id: item._id, medicationRequestId: requestId },
          {
            medicationName: item.medicationName,
            dosage: item.dosage,
            instruction: item.instruction,
          },
          { new: true },
        );
        if (updated) updatedItems.push(updated);
      } else {
        // Thêm mới
        const created = await RequestItemModel.create({
          medicationRequestId: requestId,
          medicationName: item.medicationName,
          dosage: item.dosage,
          instruction: item.instruction,
        });
        updatedItems.push(created);
      }
    }

    return updatedItems;
  }
}

export default MedicationRequestService;
