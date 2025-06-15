import { Class } from '../models/class.model';
import { HealthCheckCampaign } from '../models/healthcheck.campaign.model';
import { HealthCheckConsent } from '../models/healthcheck.consents.model';
import { HealthCheckResult } from '../models/healthcheck.result.model';
import { MedicalIncidentModel } from '../models/medical.incident.model';
import { MedicalInventoryModel } from '../models/medical.inventory.model';
import { MedicationRequestModel } from '../models/medication.request.model';
import { StudentModel } from '../models/student.model';

// Giả định bạn có các file enums này
import { ConsentStatus } from '@/enums/ConsentsEnum';

// Bạn nên tạo file interface này để code an toàn hơn
import { IDashboardData, IHealthAnalytics, IOperationalMonitoring, IQuickStats } from '@/interfaces/dashboard.interface';


export class DashboardService {
    
    /**
     * HÀM CHÍNH: LẤY TOÀN BỘ DỮ LIỆU CHO DASHBOARD ADMIN
     * Gọi song song tất cả các hàm lấy dữ liệu phụ để tối ưu hiệu năng.
     */
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

    // =================================================================
    // CÁC HÀM PHỤ (PRIVATE) CHO TỪNG WIDGET
    // =================================================================

    private static async _getQuickStats(): Promise<IQuickStats> {
        const [
            totalStudents,
            incidentsThisWeek,
            pendingMedicationRequests,
            inventoryAlerts
        ] = await Promise.all([
            StudentModel.countDocuments(),
            MedicalIncidentModel.countDocuments({ incidentTime: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } }),
            MedicationRequestModel.countDocuments({ status: 'PENDING' }), // Xác nhận giá trị enum nếu có
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
            this._getHealthClassification(),
            this._getCommonIssues(),
            this._getBmiTrendBySchoolYear(),
        ]);
        return { healthClassification, commonIssues, bmiTrend };
    }
    
    private static async _getOperationalMonitoring(): Promise<IOperationalMonitoring> {
         const [
            latestCampaignStatus,
            recentIncidents,
        ] = await Promise.all([
            this._getLatestCampaignStatus(),
            // Đã cập nhật: populate fullName từ StudentModel
            MedicalIncidentModel.find()
                .sort({ incidentTime: -1 })
                .limit(5)
                .populate({
                    path: 'studentId',
                    select: 'fullName' // Chỉ lấy trường fullName từ StudentModel
                })
        ]);
        return { latestCampaignStatus, recentIncidents };
    }

    // =================================================================
    // CÁC HÀM AGGREGATION PHỨC TẠP
    // =================================================================
    
    private static async _getHealthClassification(): Promise<any[]> {
        return HealthCheckResult.aggregate([
            { $sort: { studentId: 1, checkupDate: -1 } },
            { $group: { _id: "$studentId", latestClassification: { $first: "$overallConclusion" } } },
            { $match: { latestClassification: { $ne: null, $ne: "" } } },
            { $group: { _id: "$latestClassification", count: { $sum: 1 } } },
            { $project: { _id: 0, classification: "$_id", count: "$count" } }
        ]);
    }

    private static async _getCommonIssues(): Promise<any[]> {
        return HealthCheckResult.aggregate([
            { $unwind: '$resultsData' },
            { $match: { 'resultsData.isAbnormal': true } },
            { $group: { _id: '$resultsData.itemName', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { _id: 0, issue: '$_id', studentCount: '$count' } }
        ]);
    }
    
    private static async _getBmiTrendBySchoolYear(): Promise<any[]> {
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

    /**
     * Lấy trạng thái của đợt khám SK gần nhất - Đã tối ưu
     * Tận dụng mảng `students` trong `ClassModel` để có hiệu năng tốt và code đơn giản.
     */
    private static async _getLatestCampaignStatus(): Promise<any> {
        const latestCampaign = await HealthCheckCampaign.findOne().sort({ createdAt: -1 });
        if (!latestCampaign) {
            return { name: "Chưa có đợt khám nào", total: 0, approved: 0, declined: 0 };
        }
        
        const campaignId = latestCampaign._id;

        // BƯỚC 1: Lấy danh sách các lớp thuộc khối lớp mục tiêu
        const targetClasses = await Class.find({
            gradeLevel: { $in: latestCampaign.targetGradeLevels }
        }).select('students'); // Chỉ lấy trường 'students'

        // BƯỚC 2: Gộp tất cả học sinh từ các lớp đó vào một mảng ID duy nhất
        const targetStudentIds = targetClasses.flatMap(cls => cls.students);
        const totalTargeted = targetStudentIds.length;

        // BƯỚC 3: Đếm consent DỰA TRÊN danh sách học sinh mục tiêu đã tìm được
        const [approvedCount, declinedCount] = await Promise.all([
            HealthCheckConsent.countDocuments({
                campaignId,
                status: ConsentStatus.APPROVED,
                studentId: { $in: targetStudentIds }
            }),
            HealthCheckConsent.countDocuments({
                campaignId,
                status: ConsentStatus.DECLINED,
                studentId: { $in: targetStudentIds }
            })
        ]);
        
        return {
            name: latestCampaign.name,
            total: totalTargeted,
            approved: approvedCount,
            declined: declinedCount,
        };
    }
}