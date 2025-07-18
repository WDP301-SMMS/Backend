import { Request, Response, NextFunction } from 'express';
import MedicalIncidentService from '@/services/incident/incident.service';

const service = new MedicalIncidentService();

const createIncident = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const nurseId = req.user?._id;

    if (!nurseId) {
      res.status(401).json({ message: 'Không xác định được y tá từ token' });
      return;
    }

    const incident = await service.createIncident({
      ...req.body,
      nurseId,
    });

    res.status(201).json({
      message: 'Tạo sự cố y tế thành công',
      data: incident,
    });
  } catch (err) {
    next(err);
  }
};

const getAllIncidents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, severity, nurseId, studentId } = req.query;

    const result = await service.getAllIncidents({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      severity: severity as string,
      nurseId: nurseId as string,
      studentId: studentId as string,
    });

    res.status(200).json({
      message: 'Lấy tất cả sự cố y tế thành công',
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

const getIncidentById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const incident = await service.getIncidentById(id);
    res
      .status(200)
      .json({ message: 'Lấy sự cố y tế theo ID thành công', data: incident });
  } catch (err) {
    next(err);
  }
};

const updateIncident = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const updated = await service.updateIncident(id, req.body);
    res
      .status(200)
      .json({ message: 'Cập nhật sự cố thành công', data: updated });
  } catch (err) {
    next(err);
  }
};

const getNurseIncidents = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const nurseId = req.user?._id;

    if (!nurseId) {
      res.status(401).json({
        message: 'Không xác định được ID của y tá từ token.',
      });
      return;
    }

    const { page, limit, severity, studentId } = req.query;

    const result = await service.getAllIncidents({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      severity: severity as string,
      nurseId: nurseId.toString(),
      studentId: studentId as string,
    });

    res.status(200).json({
      message: 'Lấy các sự cố của y tá hiện tại thành công',
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const MedicalIncidentController = {
  createIncident,
  getAllIncidents,
  getIncidentById,
  updateIncident,
  getNurseIncidents,
};
