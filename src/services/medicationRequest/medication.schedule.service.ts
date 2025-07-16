import { MedicationScheduleModel } from '@/models/medication.schedule.model';
import { MedicationRequestModel } from '@/models/medication.request.model';
import { MedicationScheduleEnum } from '@/enums/MedicationEnum';
import { AppError } from '@/utils/globalErrorHandler';
import { Types } from 'mongoose';

const createAppError = (status: number, message: string): AppError => {
  const error: AppError = new Error(message);
  error.status = status;
  return error;
};

class MedicationScheduleService {
  public async createSchedules(schedules: any[]) {
    return await MedicationScheduleModel.insertMany(schedules);
  }

  public async updateScheduleStatus(
    scheduleId: string,
    newStatus: MedicationScheduleEnum,
    nurseId: string,
    reason?: string,
  ) {
    const schedule = await MedicationScheduleModel.findById(scheduleId);
    if (!schedule) throw createAppError(404, 'Không tìm thấy lịch uống');

    if (schedule.status === newStatus) {
      throw createAppError(400, `Lịch uống đã được đánh dấu là ${newStatus}.`);
    }

    if (
      [
        MedicationScheduleEnum.Not_taken,
        MedicationScheduleEnum.Cancelled,
      ].includes(newStatus) &&
      !reason
    ) {
      throw createAppError(
        400,
        `Lý do là bắt buộc khi trạng thái là '${newStatus}'.`,
      );
    }

    schedule.status = newStatus;
    schedule.reason = reason;
    schedule.nurseId = new Types.ObjectId(nurseId);
    await schedule.save();

    const { medicationRequestId } = schedule;
    const total = await MedicationScheduleModel.countDocuments({
      medicationRequestId,
    });
    const finished = await MedicationScheduleModel.countDocuments({
      medicationRequestId,
      status: { $in: ['Done', 'Cancelled'] },
    });

    if (total === finished) {
      await MedicationRequestModel.findByIdAndUpdate(medicationRequestId, {
        status: 'Completed',
      });
    }

    return schedule;
  }

  public async getSchedulesByRequestId(
    medicationRequestId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const filter: any = { medicationRequestId };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    return await MedicationScheduleModel.find(filter).sort({ date: 1 });
  }

  public async getSchedulesByStudentId(
    studentId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const filter: any = { studentId };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    return await MedicationScheduleModel.find(filter).sort({ date: 1 });
  }
}

export default MedicationScheduleService;
