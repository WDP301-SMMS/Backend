import MedicationRequestService from '@/services/medicationRequest/medication.request.service';
import { Request, Response, NextFunction } from 'express';

const service = new MedicationRequestService();

const createMedicationRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await service.createRequest(req.body);
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
    const data = await service.getAllRequest(); // đúng tên hàm service
    res.status(200).json({ message: 'Lấy danh sách thành công', data });
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
    const { id } = req.params;
    const result = await service.getRequestByParentId(id);
    res.status(200).json({ message: 'Request retrieved', data: result });
  } catch (err) {
    next(err);
  }
};

export const RequestController = {
  createMedicationRequest,
  getAllRequest,
  getMedicationRequestById,
  getMedicationRequestByParentId,
};
