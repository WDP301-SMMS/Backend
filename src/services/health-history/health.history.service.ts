import { StudentModel } from '@/models/student.model';
import { VaccinationCampaignModel } from '@/models/vaccination.campaign.model';
import { VaccinationConsentModel } from '@/models/vaccination.consent.model';
import { VaccinationRecordModel } from '@/models/vacination.record.model';
import { HealthCheckCampaign } from '@/models/healthcheck.campaign.model';
import { HealthCheckResult } from '@/models/healthcheck.result.model';
import { AppError } from '@/utils/globalErrorHandler';

const createError = (status: number, message: string): AppError => {
    const error: AppError = new Error(message);
    error.status = status;
    return error;
};

interface IStudentHealthHistoryResponse {
    studentId: string;
    studentName: string;
    className: string;
    schoolYear: string;
    healthChecks: IHealthCheckHistoryItem[];
    vaccinations: IVaccinationHistoryItem[];
}

interface IHealthCheckHistoryItem {
    campaignName: string;
    checkupDate: Date;
    overallConclusion?: string;
    recommendations?: string;
    nurseName?: string;
    details: {
        itemName: string;
        value: any;
        unit?: string | null; // <-- SỬA LỖI Ở ĐÂY: Thêm "| null"
        isAbnormal: boolean;
    }[];
}

interface IVaccinationHistoryItem {
    campaignName: string;
    vaccineName: string;
    doseNumber: number;
    administeredAt: Date;
    administeredBy: string;
    location: string;
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
    ): Promise<IStudentHealthHistoryResponse> {
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

        const healthCampaigns = await HealthCheckCampaign.find({ schoolYear }).select('_id');
        const healthCampaignIds = healthCampaigns.map(c => c._id);

        let healthChecksData: IHealthCheckHistoryItem[] = [];
        if (healthCampaignIds.length > 0) {
            const healthResults = await HealthCheckResult.find({
                studentId: studentId,
                campaignId: { $in: healthCampaignIds },
            })
                .populate({ path: 'campaignId', select: 'name' })
                .populate({ path: 'nurseId', select: 'username' })
                .sort({ checkupDate: -1 })
                .lean();

            healthChecksData = healthResults.map(result => ({
                campaignName: (result.campaignId as any)?.name || 'N/A',
                checkupDate: result.checkupDate,
                overallConclusion: result.overallConclusion,
                recommendations: result.recommendations,
                nurseName: (result.nurseId as any)?.username || 'N/A',
                details: result.resultsData.map(d => ({
                    itemName: d.itemName,
                    value: d.value,
                    unit: d.unit,
                    isAbnormal: d.isAbnormal,
                })),
            }));
        }

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
                    location: (record.partnerId as any)?.name || 'N/A',
                    observations: record.postVaccinationChecks.map(obs => ({
                        observedAt: obs.observedAt,
                        notes: obs.notes,
                        isAbnormal: obs.isAbnormal,
                    })),
                }));
            }
        }

        const finalResponse: IStudentHealthHistoryResponse = {
            studentId: studentId,
            studentName: student.fullName,
            className: (student.classId as any)?.className || 'Chưa xếp lớp',
            schoolYear: schoolYear,
            healthChecks: healthChecksData,
            vaccinations: vaccinationsData,
        };

        return finalResponse;
    }
}