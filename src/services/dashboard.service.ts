import { Class } from '../models/class.model';
import { HealthCheckCampaign } from '../models/healthcheck.campaign.model';
import { HealthCheckConsent } from '../models/healthcheck.consents.model';
import { HealthCheckResult } from '../models/healthcheck.result.model';
import { MedicalIncidentModel } from '../models/medical.incident.model';
import { MedicalInventoryModel } from '../models/medical.inventory.model';
import { MedicationRequestModel } from '../models/medication.request.model';
import { StudentModel } from '../models/student.model';
import { ConsentStatus } from '@/enums/ConsentsEnum';
import { IDashboardData, IHealthAnalytics, IOperationalMonitoring, IQuickStats } from '@/interfaces/dashboard.interface';
import mongoose from 'mongoose';


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
            StudentModel.countDocuments(),
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

    private static async _getHealthClassification(): Promise<any[]> {
        return HealthCheckResult.aggregate([
            { $sort: { studentId: 1, checkupDate: -1 } },
            { $group: { _id: "$studentId", latestClassification: { $first: "$overallConclusion" } } },
            { $match: { latestClassification: { $nin: [null, ""] } } }, // Loại bỏ các giá trị rỗng
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


    private static async _getLatestCampaignStatus(): Promise<any> {
        const latestCampaign = await HealthCheckCampaign.findOne().sort({ createdAt: -1 });
        if (!latestCampaign) {
            return { name: "Chưa có đợt khám nào", total: 0, approved: 0, declined: 0 };
        }
        
        const campaignId = latestCampaign._id;
        const targetClasses = await Class.find({
            gradeLevel: { $in: latestCampaign.targetGradeLevels }
        }).select('students');

        const targetStudentIds = targetClasses.flatMap(
            (cls: { students: mongoose.Types.ObjectId[] }) => cls.students
        );
        const totalTargeted = targetStudentIds.length;

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