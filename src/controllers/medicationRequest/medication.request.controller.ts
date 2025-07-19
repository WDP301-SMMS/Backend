import MedicationRequestService from '@/services/medicationRequest/medication.request.service';
import { Request, Response, NextFunction } from 'express';

const service = new MedicationRequestService();

const createMedicationRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cleanBody = Object.fromEntries(Object.entries(req.body));

    const data = await service.createRequest(cleanBody);
    res.status(201).json({ message: 'Yêu cầu uống thuốc thành công', data });
  } catch (err) {
    next(err);
  }
};

const getAllRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, status, parentId, studentId, startDate, endDate } =
      req.query;

    const result = await service.getAllRequest({
      page: Number(page),
      limit: Number(limit),
      status: status as string,
      parentId: parentId as string,
      studentId: studentId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.status(200).json({
      message: 'Lấy danh sách thành công',
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

const getMedicationRequestById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await service.getRequestById(id);
    res.status(200).json({ message: 'Request retrieved', data: result });
  } catch (err) {
    next(err);
  }
};

const getMedicationRequestByParentId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parentId = req.user?._id;

    if (!parentId) {
      res
        .status(401)
        .json({ message: 'Không xác định được phụ huynh từ token' });
      return;
    }

    const { page, limit, status, studentId, startDate, endDate } = req.query;

    const result = await service.getRequestByParentId(parentId.toString(), {
      page: Number(page),
      limit: Number(limit),
      status: status as string,
      studentId: studentId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.status(200).json({
      message: 'Lấy yêu cầu của phụ huynh thành công',
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

const updateMedicationRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await service.updateRequestById(id, req.body);
    res
      .status(200)
      .json({ message: 'Cập nhật yêu cầu thành công', data: result });
  } catch (err) {
    next(err);
  }
};

const updateRequestItems = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    const result = await service.updateRequestItems(id, items);
    res.status(200).json({
      message: 'Cập nhật danh sách thuốc thành công',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const RequestController = {
  createMedicationRequest,
  getAllRequest,
  getMedicationRequestById,
  getMedicationRequestByParentId,
  updateMedicationRequest,
  updateRequestItems,
};
