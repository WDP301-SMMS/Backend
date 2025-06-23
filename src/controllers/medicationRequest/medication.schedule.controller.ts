import MedicationScheduleService from '@/services/medicationRequest/medication.schedule.service';
import { Request, Response, NextFunction } from 'express';

const service = new MedicationScheduleService();

const createSchedules = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schedules = await service.createSchedules(req.body);
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
    const { nurseId, status, reason } = req.body;

    const updated = await service.updateScheduleStatus(
      scheduleId,
      status,
      nurseId,
      reason,
    );

    res.status(200).json({ message: 'Schedule status updated', data: updated });
  } catch (err) {
    next(err);
  }
};

export const ScheduleController = {
  createSchedules,
  updateScheduleStatus,
};
