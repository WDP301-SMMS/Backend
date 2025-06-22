import {
  MedicationRequestModel,
  RequestItemModel,
} from '@/models/medication.request.model';
import { AppError } from '@/utils/globalErrorHandler';

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
        select: 'username email',
      })
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'username',
        },
      });
    if (!requests || requests.length === 0) {
      throw createAppError(404, 'Không tìm thấy yêu cầu nào.');
    }
    return requests;
  }

  public async getRequestById(id: string) {
    const request = await MedicationRequestModel.findById(id)
      .populate({
        path: 'parentId',
        select: 'username email',
      })
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'username',
        },
      });
    if (!request) throw createAppError(404, 'Request not found.');
    return request;
  }

  public async getRequestByParentId(parentId: string) {
    const request = await MedicationRequestModel.find({ parentId })
      .populate({
        path: 'parentId',
        select: 'username email',
      })
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'username',
        },
      });

    if (!request || request.length === 0) {
      throw createAppError(404, 'Request not found.');
    }

    return request;
  }
}

export default MedicationRequestService;
