import { MedicationScheduleModel } from '@/models/medication.schedule.model';
import { MedicationRequestModel } from '@/models/medication.request.model';
import {
  MedicationScheduleEnum,
  MedicationRequestEnum,
} from '@/enums/MedicationEnum';
import { AppError } from '@/utils/globalErrorHandler';
import { Types } from 'mongoose';

const createAppError = (status: number, message: string): AppError => {
  const error: AppError = new Error(message);
  error.status = status;
  return error;
};

class MedicationScheduleService {
  public async createSchedules(schedulesInput: any[], createdByNurse: string) {
    if (!Array.isArray(schedulesInput) || schedulesInput.length === 0) {
      throw createAppError(400, 'Danh sách lịch không hợp lệ.');
    }

    const { medicationRequestId } = schedulesInput[0];
    const request = await MedicationRequestModel.findById(medicationRequestId);
    if (!request) throw createAppError(404, 'Không tìm thấy yêu cầu thuốc.');

    const studentId = request.studentId;

    const schedules = schedulesInput.map((item) => ({
      ...item,
      studentId,
      createdByNurse: new Types.ObjectId(createdByNurse),
    }));

    const created = await MedicationScheduleModel.insertMany(schedules);

    await MedicationRequestModel.findByIdAndUpdate(medicationRequestId, {
      status: MedicationRequestEnum.Scheduled,
    });

    return created;
  }

  public async updateScheduleStatus(
    scheduleId: string,
    newStatus: MedicationScheduleEnum,
    updatedByNurse: string,
    reason?: string,
  ) {
    const schedule = await MedicationScheduleModel.findById(scheduleId);
    if (!schedule) throw createAppError(404, 'Không tìm thấy lịch uống');

    if (schedule.status === newStatus) {
      throw createAppError(400, `Lịch uống đã có trạng thái '${newStatus}'`);
    }

    const allSchedules = await MedicationScheduleModel.find({
      medicationRequestId: schedule.medicationRequestId,
    }).sort({ date: 1 });

    const index = allSchedules.findIndex(
      (s) => s._id.toString() === scheduleId,
    );
    const previousSchedules = allSchedules.slice(0, index);

    const hasUnfinished = previousSchedules.some(
      (s) => s.status === MedicationScheduleEnum.Pending,
    );

    if (hasUnfinished) {
      throw createAppError(
        400,
        'Phải hoàn thành các lịch trước đó trước khi cập nhật lịch này.',
      );
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

    // ✅ Chỉ cập nhật sang In_progress nếu đang Scheduled và lịch này là lịch đầu tiên
    const request = await MedicationRequestModel.findById(
      schedule.medicationRequestId,
    );

    const isFirstSchedule =
      allSchedules.length > 0 &&
      allSchedules[0]._id.toString() === schedule._id.toString();

    const isTriggerStatus = [
      MedicationScheduleEnum.Done,
      MedicationScheduleEnum.Not_taken,
    ].includes(newStatus);

    if (
      request &&
      request.status === MedicationRequestEnum.Scheduled &&
      isFirstSchedule &&
      isTriggerStatus
    ) {
      await MedicationRequestModel.findByIdAndUpdate(request._id, {
        status: MedicationRequestEnum.In_progress,
      });
    }

    // Cập nhật trạng thái lịch
    schedule.status = newStatus;
    schedule.reason = reason;
    schedule.updatedByNurse = new Types.ObjectId(updatedByNurse);
    await schedule.save();

    // Nếu tất cả lịch đều đã Done hoặc Not_taken -> Completed
    const total = await MedicationScheduleModel.countDocuments({
      medicationRequestId: schedule.medicationRequestId,
    });

    const finished = await MedicationScheduleModel.countDocuments({
      medicationRequestId: schedule.medicationRequestId,
      status: { $in: ['Done', 'Not_taken'] },
    });

    if (total === finished) {
      await MedicationRequestModel.findByIdAndUpdate(
        schedule.medicationRequestId,
        {
          status: MedicationRequestEnum.Completed,
        },
      );
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

    const schedules = await MedicationScheduleModel.find(filter)
      .sort({ date: 1 })
      .populate({
        path: 'studentId',
        select: 'fullName classId',
        populate: {
          path: 'classId',
          select: 'className',
        },
      })
      .populate({ path: 'createdByNurse', select: 'username' })
      .populate({ path: 'updatedByNurse', select: 'username' });

    return schedules.map((s) => {
      const student = s.studentId as any;
      return {
        ...s.toObject(),
        studentId: {
          _id: student?._id,
          fullName: student?.fullName,
          className: student?.classId?.className || null,
        },
      };
    });
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

    const schedules = await MedicationScheduleModel.find(filter)
      .sort({ date: 1 })
      .populate({
        path: 'studentId',
        select: 'fullName classId',
        populate: {
          path: 'classId',
          select: 'className',
        },
      })
      .populate({ path: 'createdByNurse', select: 'username' })
      .populate({ path: 'updatedByNurse', select: 'username' });

    return schedules.map((s) => {
      const student = s.studentId as any;
      return {
        ...s.toObject(),
        studentId: {
          _id: student?._id,
          fullName: student?.fullName,
          className: student?.classId?.className || null,
        },
      };
    });
  }
}

export default MedicationScheduleService;
