import MedicationScheduleService from '@/services/medicationRequest/medication.schedule.service';
import { Request, Response, NextFunction } from 'express';

const service = new MedicationScheduleService();

const createSchedules = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const createdByNurse = req.user?._id;

    if (!createdByNurse) {
      res.status(401).json({ message: 'Không xác định được y tá từ token' });
      return;
    }

    const schedules = await service.createSchedules(req.body, createdByNurse);
    res
      .status(201)
      .json({ message: 'Tạo lịch uống thành công', data: schedules });
  } catch (err) {
    next(err);
  }
};

const updateScheduleStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { scheduleId } = req.params;
    const updatedByNurse = req.user?._id;
    const { status, reason } = req.body;

    if (!updatedByNurse) {
      res.status(401).json({ message: 'Không xác định được y tá từ token' });
      return;
    }

    const updated = await service.updateScheduleStatus(
      scheduleId,
      status,
      updatedByNurse,
      reason,
    );
    res
      .status(200)
      .json({ message: 'Cập nhật trạng thái thành công', data: updated });
  } catch (err) {
    next(err);
  }
};

const getSchedulesByRequestId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { medicationRequestId } = req.params;
    const { startDate, endDate } = req.query;

    const schedules = await service.getSchedulesByRequestId(
      medicationRequestId,
      startDate as string,
      endDate as string,
    );

    res.status(200).json({
      message: 'Lấy danh sách lịch theo yêu cầu thành công',
      data: schedules,
    });
  } catch (err) {
    next(err);
  }
};

const getSchedulesByStudentId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    const schedules = await service.getSchedulesByStudentId(
      studentId,
      startDate as string,
      endDate as string,
    );

    res.status(200).json({
      message: 'Lấy danh sách lịch theo học sinh thành công',
      data: schedules,
    });
  } catch (err) {
    next(err);
  }
};

export const ScheduleController = {
  createSchedules,
  updateScheduleStatus,
  getSchedulesByRequestId,
  getSchedulesByStudentId,
};
