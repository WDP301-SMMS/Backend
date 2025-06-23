import {
  MedicationRequestModel,
  RequestItemModel,
} from '@/models/medication.request.model';
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

  public async getAllRequest() {
    const requests = await MedicationRequestModel.find()
      .populate({
        path: 'parentId',
        select: 'username', //Thêm gender vào
      })
      .populate({
        path: 'studentId',
        select: 'fullName', //thêm gender vào
      });
    if (!requests || requests.length === 0) {
      throw createAppError(404, 'Không tìm thấy yêu cầu nào.');
    }
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
    return resultWithItems;
  }

  public async getRequestById(id: string) {
    const request = await MedicationRequestModel.findById(id)
      .populate({
        path: 'parentId',
        select: 'username', //Thêm gender vào
      })
      .populate({
        path: 'studentId',
        select: 'fullName', //thêm gender vào
      });
    if (!request) throw createAppError(404, 'Request not found.');

    const requestItems = await RequestItemModel.find({
      medicationRequestId: request._id,
    });

    return {
      ...request.toObject(),
      requestItems,
    };
  }

  public async getRequestByParentId(parentId: string) {
    const requests = await MedicationRequestModel.find({ parentId })
      .populate({
        path: 'parentId',
        select: 'username', //Thêm gender vào
      })
      .populate({
        path: 'studentId',
        select: 'fullName', //thêm gender vào
      });

    if (!requests || requests.length === 0) {
      throw createAppError(404, 'Request not found.');
    }

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

    return resultWithItems;
  }

  public async updateRequestById(
    id: string,
    updateData: Partial<IMedicationRequest> & { requestItems?: IRequestItem[] },
  ) {
    // Lọc ra các field cần cập nhật thực sự (patch đúng bản chất)
    const {
      parentId,
      studentId,
      startDate,
      endDate,
      prescriptionFile,
      status,
      requestItems,
    } = updateData;

    const updateFields: Partial<IMedicationRequest> = {};
    if (parentId) updateFields.parentId = parentId;
    if (studentId) updateFields.studentId = studentId;
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
      throw createAppError(404, 'Request not found.');
    }

    // Cập nhật request items nếu có
    if (Array.isArray(requestItems)) {
      await RequestItemModel.deleteMany({ medicationRequestId: id });

      const newItems = requestItems.map((item) => ({
        ...item,
        medicationRequestId: updatedRequest._id,
      }));

      await RequestItemModel.insertMany(newItems);
    }

    return updatedRequest;
  }
}

export default MedicationRequestService;
