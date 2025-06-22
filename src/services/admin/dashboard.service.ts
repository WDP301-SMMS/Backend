import { HealthCheckCampaign } from '../../models/healthcheck.campaign.model';
import { HealthCheckConsent } from '../../models/healthcheck.consents.model';
import { HealthCheckResult } from '../../models/healthcheck.result.model';
import { MedicalIncidentModel } from '../../models/medical.incident.model';
import { MedicalInventoryModel } from '../../models/medical.inventory.model';
import { MedicationRequestModel } from '../../models/medication.request.model';
import { StudentModel } from '../../models/student.model';
import { ConsentStatus } from '@/enums/ConsentsEnum';
import { IDashboardData, IHealthAnalytics, IOperationalMonitoring, IQuickStats } from '@/interfaces/dashboard.interface';
import { HealthDevelopmentTracker } from '../../models/health.development.tracker.model';

export class DashboardService {
    public static async getAdminDashboardData(): Promise<IDashboardData> {
        const [
            quickStats,
            healthAnalytics,
            operationalMonitoring,
        ] = await Promise.all([
            this._getQuickStats(),
            this._getHealthAnalytics(),
            this._getOperationalMonitoring(),
        ]);

        return {
            quickStats,
            healthAnalytics,
            operationalMonitoring,
        };
    }

    private static async _getQuickStats(): Promise<IQuickStats> {
        const [
            totalStudents,
            incidentsThisWeek,
            pendingMedicationRequests,
            inventoryAlerts
        ] = await Promise.all([
            StudentModel.countDocuments({ status: 'ACTIVE' }), 
            MedicalIncidentModel.countDocuments({ incidentTime: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } }),
            MedicationRequestModel.countDocuments({ status: 'PENDING' }),
            MedicalInventoryModel.countDocuments({ $expr: { $lte: ['$quantityTotal', '$lowStockThreshold'] } })
        ]);
        return { totalStudents, incidentsThisWeek, pendingMedicationRequests, inventoryAlerts };
    }

    private static async _getHealthAnalytics(): Promise<IHealthAnalytics> {
        const [
            healthClassification,
            commonIssues,
            bmiTrend,
        ] = await Promise.all([
            this._getHealthClassificationFromTracker(),
            this._getCommonIssues(),
            this._getBmiTrendFromTracker(),
        ]);
        return { healthClassification, commonIssues, bmiTrend };
    }
    
    private static async _getOperationalMonitoring(): Promise<IOperationalMonitoring> {
         const [
            latestCampaignStatus,
            recentIncidents,
        ] = await Promise.all([
            this._getLatestCampaignStatus(),
            MedicalIncidentModel.find()
                .sort({ incidentTime: -1 })
                .limit(5)
                .populate({
                    path: 'studentId',
                    select: 'fullName' 
                })
        ]);
        return { latestCampaignStatus, recentIncidents };
    }

    private static async _getHealthClassificationFromTracker(): Promise<any[]> {
        // Ví dụ: < 18.5 là Gầy, 18.5-24.9 là Bình thường, > 25 là Thừa cân
        return HealthDevelopmentTracker.aggregate([
            { $unwind: "$bmiHistory" },
            { $sort: { "bmiHistory.date": -1 } },
            { $group: { 
                _id: "$studentId", 
                latestBmi: { $first: "$bmiHistory.value" } 
            }},
            {
                $project: {
                    classification: {
                        $switch: {
                            branches: [
                                { case: { $lt: ["$latestBmi", 18.5] }, then: "Gầy" },
                                { case: { $and: [{ $gte: ["$latestBmi", 18.5] }, { $lt: ["$latestBmi", 25] }] }, then: "Bình thường" },
                                { case: { $gte: ["$latestBmi", 25] }, then: "Thừa cân/Béo phì" }
                            ],
                            default: "Chưa phân loại"
                        }
                    }
                }
            },
            { $group: {
                _id: "$classification",
                count: { $sum: 1 }
            }},
            { $project: {
                _id: 0,
                classification: "$_id",
                count: "$count"
            }}
        ]);
    }

    private static async _getCommonIssues(): Promise<any[]> {
        // HÀM NÀY ĐÃ RẤT TỐT VÀ TẬN DỤNG ĐÚNG THIẾT KẾ MỚI, GIỮ NGUYÊN
        return HealthCheckResult.aggregate([
            { $unwind: '$resultsData' },
            { $match: { 'resultsData.isAbnormal': true } },
            { $group: { _id: '$resultsData.itemName', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { _id: 0, issue: '$_id', studentCount: '$count' } }
        ]);
    }
    
    // TỐI ƯU: Lấy xu hướng BMI từ Tracker thay vì join nhiều bảng
    private static async _getBmiTrendFromTracker(): Promise<any[]> {
        return HealthCheckResult.aggregate([
            { $match: { "resultsData.itemName": "BMI" } },
            { $unwind: "$resultsData" },
            { $match: { "resultsData.itemName": "BMI" } },
            {
                $lookup: {
                    from: "healthcheckcampaigns", 
                    localField: "campaignId",
                    foreignField: "_id",
                    as: "campaignInfo"
                }
            },
            { $unwind: "$campaignInfo" },
            {
                $group: {
                    _id: "$campaignInfo.schoolYear",
                    averageBmi: { $avg: { $toDouble: "$resultsData.value" } }
                }
            },
            { $sort: { "_id": 1 } },
            {
                $project: {
                    _id: 0,
                    schoolYear: "$_id",
                    averageBmi: { $round: ["$averageBmi", 2] }
                }
            }
        ]);
    }


    private static async _getLatestCampaignStatus(): Promise<any> {
        const latestCampaign = await HealthCheckCampaign.findOne().sort({ createdAt: -1 });

        if (!latestCampaign) {
            return { name: "Chưa có đợt khám nào", total: 0, approved: 0, declined: 0, pending: 0 };
        }
        
        const consentStats = await HealthCheckConsent.aggregate([
            { $match: { campaignId: latestCampaign._id } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const statsMap = new Map<string, number>();
        consentStats.forEach(stat => {
            statsMap.set(stat._id, stat.count);
        });

        const approved = statsMap.get(ConsentStatus.APPROVED) || 0;
        const declined = statsMap.get(ConsentStatus.DECLINED) || 0;
        const pending = statsMap.get(ConsentStatus.PENDING) || 0;
        const total = approved + declined + pending;

        return {
            name: latestCampaign.name,
            total,
            approved,
            declined,
            pending
        };
    }
}