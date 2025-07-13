import { StudentModel } from '@/models/student.model';
import { HealthCheckResult } from '@/models/healthcheck.result.model';
import { VaccinationCampaignModel } from '@/models/vaccination.campaign.model';
import { VaccinationConsentModel } from '@/models/vaccination.consent.model';
import { VaccinationRecordModel } from '@/models/vacination.record.model';
import mongoose from 'mongoose';
import { AppError } from '@/utils/globalErrorHandler';

const createError = (status: number, message: string): AppError => {
  const error: AppError = new Error(message);
  error.status = status;
  return error;
};

interface IStudentHealthHistoryResponse {
  studentId: string;
  studentName: string;
  currentClassName: string;
  schoolYear: string;
  healthChecks: IHealthCheckHistoryItem[];
  vaccinations: IVaccinationHistoryItem[];
}

interface IHealthCheckHistoryItem {
  campaignName: string;
  className: string;
  checkupDate: Date;
  overallConclusion?: string;
  recommendations?: string;
  nurseName?: string;
  details: {
    itemName: string;
    value: any;
    unit?: string | null;
    isAbnormal: boolean;
  }[];
}

interface IVaccinationHistoryItem {
  campaignName: string;
  vaccineName: string;
  doseNumber: number;
  administeredAt: Date;
  administeredBy: string;
  organizationName: string;
  observations: {
    observedAt: Date;
    notes?: string;
    isAbnormal: boolean;
  }[];
}

export class HealthHistoryService {
  public async getHealthHistoryBySchoolYear(
    studentId: string,
    schoolYear: string,
    parentId: string,
  ): Promise<any> {
    const student = await StudentModel.findById(studentId)
      .select('fullName parentId classId')
      .populate({ path: 'classId', select: 'className' })
      .lean();

    if (!student) {
      throw createError(404, 'Student not found');
    }
    if (!student.parentId || !student.parentId.equals(parentId)) {
      throw createError(403, 'You are not authorized to view this health history.');
    }

    const healthChecksData: IHealthCheckHistoryItem[] = await HealthCheckResult.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      {
        $lookup: {
          from: 'healthcheckcampaigns',
          localField: 'campaignId',
          foreignField: '_id',
          as: 'campaignInfo',
        },
      },
      { $unwind: '$campaignInfo' },
      { $match: { 'campaignInfo.schoolYear': schoolYear } },
      {
        $lookup: {
          from: 'healthcheckconsents',
          let: { studentId: '$studentId', campaignId: '$campaignId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$studentId', '$$studentId'] },
                    { $eq: ['$campaignId', '$$campaignId'] },
                  ],
                },
              },
            },
          ],
          as: 'consentInfo',
        },
      },
      { $unwind: { path: '$consentInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'classes',
          localField: 'consentInfo.classId',
          foreignField: '_id',
          as: 'classInfo',
        },
      },
      { $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'nurseId',
          foreignField: '_id',
          as: 'nurseInfo',
        },
      },
      { $unwind: { path: '$nurseInfo', preserveNullAndEmptyArrays: true } },
      { $sort: { checkupDate: -1 } },
      {
        $project: {
          _id: 0,
          campaignName: { $ifNull: ['$campaignInfo.name', 'N/A'] },
          className: { $ifNull: ['$classInfo.className', 'N/A'] },
          checkupDate: '$checkupDate',
          overallConclusion: '$overallConclusion',
          recommendations: '$recommendations',
          nurseName: { $ifNull: ['$nurseInfo.username', 'N/A'] },
          details: {
            $map: {
              input: '$resultsData',
              as: 'd',
              in: {
                itemName: '$$d.itemName',
                value: '$$d.value',
                unit: '$$d.unit',
                isAbnormal: '$$d.isAbnormal',
              },
            },
          },
        },
      },
    ]);

    const vaccinationCampaigns = await VaccinationCampaignModel.find({ schoolYear }).select('_id');
    const vaccinationCampaignIds = vaccinationCampaigns.map(c => c._id);
    let vaccinationsData: IVaccinationHistoryItem[] = [];
    if (vaccinationCampaignIds.length > 0) {
      const consents = await VaccinationConsentModel.find({
        studentId: studentId,
        campaignId: { $in: vaccinationCampaignIds },
      }).select('_id');
      const consentIds = consents.map(c => c._id);

      if (consentIds.length > 0) {
        const vaccinationRecords = await VaccinationRecordModel.find({
          consentId: { $in: consentIds },
        })
          .populate({
            path: 'consentId',
            select: 'campaignId',
            populate: {
              path: 'campaignId',
              select: 'name',
            },
          })
          .populate({ path: 'administeredByStaffId', select: 'fullName' })
          .populate({ path: 'partnerId', select: 'name' })
          .sort({ administeredAt: -1 })
          .lean();

        vaccinationsData = vaccinationRecords.map(record => ({
          campaignName: (record.consentId as any)?.campaignId?.name || 'N/A',
          vaccineName: record.vaccineName,
          doseNumber: record.doseNumber,
          administeredAt: record.administeredAt,
          administeredBy: (record.administeredByStaffId as any)?.fullName || 'N/A',
          organizationName: (record.partnerId as any)?.name || 'N/A',
          observations: record.postVaccinationChecks.map(obs => ({
            observedAt: obs.observedAt,
            notes: obs.notes,
            isAbnormal: obs.isAbnormal,
          })),
        }));
      }
    }

    const finalResponse = {
      studentId: studentId,
      studentName: student.fullName,
      currentClassName: (student.classId as any)?.className || 'Chưa xếp lớp',
      schoolYear: schoolYear,
      healthChecks: healthChecksData,
      vaccinations: vaccinationsData,
    };

    return finalResponse;
  }
}