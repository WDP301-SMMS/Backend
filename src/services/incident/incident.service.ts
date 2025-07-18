import { MedicalIncidentModel } from '@/models/medical.incident.model';
import { AppError } from '@/utils/globalErrorHandler';
import { sendIncidentNotificationToParent } from '@/utils/notification.helper';

const createAppError = (status: number, message: string): AppError => {
  const error: AppError = new Error(message);
  error.status = status;
  return error;
};

class MedicalIncidentService {
  public async createIncident(data: any) {
    const newIncident = await MedicalIncidentModel.create(data);
    if (newIncident) {
      sendIncidentNotificationToParent(newIncident);
    }
    return newIncident;
  }

  public async getAllIncidents(query: {
    page?: number;
    limit?: number;
    severity?: string;
    nurseId?: string;
    studentId?: string;
  }) {
    const { page = 1, limit = 10, severity, nurseId, studentId } = query;

    const filters: Record<string, any> = {};
    if (severity) filters.severity = severity;
    if (nurseId) filters.nurseId = nurseId;
    if (studentId) filters.studentId = studentId;

    const skip = (page - 1) * limit;

    const [incidents, total] = await Promise.all([
      MedicalIncidentModel.find(filters)
        .sort({ incidentTime: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'studentId',
          select: 'fullName classId',
          populate: {
            path: 'classId',
            select: 'className',
          },
        })
        .populate({
          path: 'nurseId',
          select: 'fullName username',
        }),
      MedicalIncidentModel.countDocuments(filters),
    ]);

    const formattedIncidents = incidents.map((incident) => {
      const i = incident.toObject();

      const student = i.studentId as any;
      const nurse = i.nurseId as any;

      return {
        ...i,
        studentId: {
          _id: student?._id,
          fullName: student?.fullName,
          className: student?.classId?.className,
        },
        nurseId: {
          _id: nurse?._id,
          fullName: nurse?.username,
        },
      };
    });

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: formattedIncidents,
    };
  }

  public async getIncidentById(id: string) {
    const incident = await MedicalIncidentModel.findById(id)
      .populate({
        path: 'studentId',
        select: 'fullName classId',
        populate: {
          path: 'classId',
          select: 'className',
        },
      })
      .populate({
        path: 'nurseId',
        select: 'fullName username',
      });

    if (!incident) {
      throw createAppError(404, 'Không tìm thấy sự cố y tế');
    }

    const i = incident.toObject();
    const student = i.studentId as any;
    const nurse = i.nurseId as any;

    return {
      ...i,
      studentId: {
        _id: student?._id,
        fullName: student?.fullName,
        className: student?.classId?.className || null,
      },
      nurseId: {
        _id: nurse?._id,
        fullName: nurse?.fullName || nurse?.username || null,
      },
    };
  }

  public async updateIncident(id: string, update: any) {
    const incident = await MedicalIncidentModel.findByIdAndUpdate(id, update, {
      new: true,
    });
    if (!incident)
      throw createAppError(404, 'Không tìm thấy sự cố y tế để cập nhật');
    return incident;
  }
}

export default MedicalIncidentService;
