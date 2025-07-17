import { MedicalIncidentModel } from '@/models/medical.incident.model';
import { AppError } from '@/utils/globalErrorHandler';

const createAppError = (status: number, message: string): AppError => {
  const error: AppError = new Error(message);
  error.status = status;
  return error;
};

class MedicalIncidentService {
  public async createIncident(data: any) {
    return await MedicalIncidentModel.create(data);
  }

  public async getAllIncidents(query: {
    page?: number;
    limit?: number;
    status?: string;
    nurseId?: string;
    studentId?: string;
  }) {
    const { page = 1, limit = 10, status, nurseId, studentId } = query;

    const filters: Record<string, any> = {};

    if (status) filters.status = status;
    if (nurseId) filters.nurseId = nurseId;
    if (studentId) filters.studentId = studentId;

    const skip = (page - 1) * limit;

    const [incidents, total] = await Promise.all([
      MedicalIncidentModel.find(filters)
        .sort({ incidentTime: -1 })
        .skip(skip)
        .limit(limit),
      MedicalIncidentModel.countDocuments(filters),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: incidents,
    };
  }

  public async getIncidentById(id: string) {
    const incident = await MedicalIncidentModel.findById(id);
    if (!incident) throw createAppError(404, 'Không tìm thấy sự cố y tế');
    return incident;
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
