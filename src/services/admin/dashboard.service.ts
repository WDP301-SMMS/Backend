import { HealthCheckCampaign } from '../../models/healthcheck.campaign.model';
import { HealthCheckConsent } from '../../models/healthcheck.consents.model';
import { HealthCheckResult } from '../../models/healthcheck.result.model';
import { MedicalIncidentModel } from '../../models/medical.incident.model';
import { MedicalInventoryModel } from '../../models/medical.inventory.model';
import { MedicationRequestModel } from '../../models/medication.request.model';
import { StudentModel } from '../../models/student.model';
import { HealthProfileModel } from '../../models/health.profile.model';
import { VaccinationCampaignModel } from '../../models/vaccination.campaign.model';
import { ConsentStatus } from '@/enums/ConsentsEnum';
import { MedicationRequestEnum } from '@/enums/MedicationEnum';
import { CampaignStatus } from '@/enums/CampaignEnum';
// Import các interface Dashboard
// import { IDashboardData, IHealthAnalytics, IOperationalMonitoring, IQuickStats } from '@/interfaces/dashboard.interface';

export class DashboardService {
    // Hàm chính sẽ tổng hợp từ nhiều nguồn khác nhau
    public static async getAdminDashboardData() {
        const [
            quickStats,
            healthAnalytics,
            operationalMonitoring,
            clinicActivityStats
        ] = await Promise.all([
            this._getQuickStats(),
            this._getHealthAnalytics(),
            this._getOperationalMonitoring(),
            this._getClinicActivityStats()
        ]);

        return {
            quickStats,
            healthAnalytics,
            operationalMonitoring,
            clinicActivityStats
        };
    }

    // --- WIDGET 1: THỐNG KÊ NHANH (GIỮ LẠI VÀ BỔ SUNG) ---
    private static async _getQuickStats() {
        const [
            totalStudents,
            incidentsThisWeek,
            pendingMedicationRequests,
            inventoryAlertsResult,
            studentsWithChronicConditions
        ] = await Promise.all([
            StudentModel.countDocuments({ status: 'ACTIVE' }),
            MedicalIncidentModel.countDocuments({ incidentTime: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } }),
            MedicationRequestModel.countDocuments({ status: MedicationRequestEnum.Pending }),
            MedicalInventoryModel.aggregate([
                { $unwind: "$batches" },
                { $group: {
                    _id: "$_id",
                    totalQuantity: { $sum: "$batches.quantity" },
                    lowStockThreshold: { $first: "$lowStockThreshold" },
                    status: { $first: "$status" }
                }},
                { $match: {
                    $and: [
                        { status: { $ne: 'DISCONTINUED' } },
                        { $expr: { $lte: ["$totalQuantity", "$lowStockThreshold"] } }
                    ]
                }},
                { $count: "lowStockCount" }
            ]),
            // Bổ sung: Số học sinh có bệnh nền
            HealthProfileModel.countDocuments({ 'chronicConditions.0': { $exists: true } })
        ]);

        const inventoryAlerts = inventoryAlertsResult.length > 0 ? inventoryAlertsResult[0].lowStockCount : 0;
        return { 
            totalStudents, 
            incidentsThisWeek, 
            pendingMedicationRequests, 
            inventoryAlerts,
            studentsWithChronicConditions
        };
    }

    // --- WIDGET 2: PHÂN TÍCH SỨC KHỎE (GIỮ LẠI) ---
    private static async _getHealthAnalytics() {
        const [
            commonIssues,
            bmiTrend,
            healthClassification,
        ] = await Promise.all([
            // Vấn đề sức khỏe phổ biến
            HealthCheckResult.aggregate([
                { $unwind: '$resultsData' },
                { $match: { 'resultsData.isAbnormal': true } },
                { $group: { _id: '$resultsData.itemName', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
                { $project: { _id: 0, issue: '$_id', studentCount: '$count' } }
            ]),
            // Xu hướng BMI qua các năm
            HealthCheckResult.aggregate([
                { $unwind: "$resultsData" },
                { $match: { "resultsData.itemName": "BMI" } },
                { $lookup: { from: "healthcheckcampaigns", localField: "campaignId", foreignField: "_id", as: "campaignInfo" }},
                { $unwind: "$campaignInfo" },
                { $group: {
                    _id: "$campaignInfo.schoolYear",
                    averageBmi: { $avg: { $toDouble: "$resultsData.value" } }
                }},
                { $sort: { "_id": 1 } },
                { $project: { _id: 0, schoolYear: "$_id", averageBmi: { $round: ["$averageBmi", 2] } }}
            ]),
            // Phân loại sức khỏe tổng quát
            HealthCheckResult.aggregate([
                { $sort: { checkupDate: -1 } },
                { $group: {
                    _id: "$studentId",
                    latestResult: { $first: "$$ROOT" }
                }},
                { $group: {
                    _id: { $anyElementTrue: "$latestResult.resultsData.isAbnormal" },
                    count: { $sum: 1 }
                }},
                { $project: {
                    _id: 0,
                    classification: { $cond: ["$_id", "Có vấn đề bất thường", "Bình thường"] },
                    count: "$count"
                }}
            ])
        ]);
        return { commonIssues, bmiTrend, healthClassification };
    }
    
    // --- WIDGET 3: GIÁM SÁT HOẠT ĐỘNG (GIỮ LẠI VÀ NÂNG CẤP) ---
    private static async _getOperationalMonitoring() {
        const [
            latestCampaignsSummary,
            recentIncidents,
        ] = await Promise.all([
            // Nâng cấp: Lấy cả 2 loại chiến dịch đang hoạt động
            this._getLatestActiveCampaignsSummary(),
            // Nâng cấp: Populate thêm thông tin cho incidents
            MedicalIncidentModel.find()
                .sort({ incidentTime: -1 })
                .limit(5)
                .populate({ path: 'studentId', select: 'fullName classId', populate: { path: 'classId', select: 'className' } })
                .populate({ path: 'nurseId', select: 'username' })
                .lean()
        ]);
        return { 
            latestCampaignsSummary, 
            recentIncidents 
        };
    }

    // --- WIDGET 4: HOẠT ĐỘNG PHÒNG Y TẾ (MỚI) ---
    private static async _getClinicActivityStats() {
        const [
            totalIncidents,
            commonIncidentTypes,
        ] = await Promise.all([
            MedicalIncidentModel.countDocuments(),
            MedicalIncidentModel.aggregate([
                { $group: { _id: '$incidentType', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
                { $project: { _id: 0, type: '$_id', count: '$count' } }
            ]),
        ]);
        
        return { totalIncidents, commonIncidentTypes };
    }

    // --- HÀM HELPER CHO WIDGET 3 ---
    private static async _getLatestActiveCampaignsSummary(): Promise<any> {
        const activeStatuses = [CampaignStatus.ANNOUNCED, CampaignStatus.IN_PROGRESS];

        const [latestHealthCheck, latestVaccination] = await Promise.all([
            HealthCheckCampaign.findOne({ status: { $in: activeStatuses } }).sort({ startDate: -1 }),
            VaccinationCampaignModel.findOne({ status: { $in: activeStatuses } }).sort({ startDate: -1 })
        ]);

        let healthCheckSummary = null;
        if (latestHealthCheck) {
            const consents = await HealthCheckConsent.aggregate([
                { $match: { campaignId: latestHealthCheck._id } },
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]);
            const statsMap = consents.reduce((map, stat) => map.set(stat._id, stat.count), new Map());
            const approved = statsMap.get(ConsentStatus.APPROVED) || 0;
            const declined = statsMap.get(ConsentStatus.DECLINED) || 0;
            const total = await HealthCheckConsent.countDocuments({ campaignId: latestHealthCheck._id });
            healthCheckSummary = {
                name: latestHealthCheck.name, type: 'Khám sức khỏe', total, approved, declined,
                pending: total - approved - declined
            };
        }

        let vaccinationSummary = null;
        if (latestVaccination) {
            const { name, summary } = latestVaccination;
            vaccinationSummary = {
                name, type: 'Tiêm chủng', total: summary.totalConsents, approved: summary.approved,
                declined: summary.declined,
                pending: summary.totalConsents - summary.approved - summary.declined
            };
        }

        return { healthCheckSummary, vaccinationSummary };
    }
}