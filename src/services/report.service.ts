import mongoose from 'mongoose';
import { IPopulatedVaccinationRecord } from '@/interfaces/vacination.record.interface';
import { StudentModel } from '@/models/student.model';
import { VaccinationCampaignModel } from '@/models/vaccination.campaign.model';
import { VaccinationConsentModel } from '@/models/vaccination.consent.model';

import { AppError } from '@/utils/globalErrorHandler';
import { VaccinationRecordModel } from '@/models/vacination.record.model';

export class ReportService {

  public async getStudentVaccinationHistory(studentId: string): Promise<IPopulatedVaccinationRecord[]> {
    const records = await VaccinationRecordModel.find({ studentId })
      .populate({
        path: 'partnerId',
        select: 'name',
      })
      .populate({
        path: 'administeredByStaffId',
        select: 'fullName',
      })
      .sort({ administeredAt: -1 });

    if (!records) {
      return [];
    }

    return records as unknown as IPopulatedVaccinationRecord[];
  }


   public async getCampaignFullReport(campaignId: string): Promise<any> {
    const campaignInfo = await VaccinationCampaignModel.findById(campaignId).lean();
    if (!campaignInfo) {
        const error: AppError = new Error('Campaign not found.');
        error.status = 404;
        throw error;
    }

    const consentAggregation = await VaccinationConsentModel.aggregate([
        { $match: { campaignId: new mongoose.Types.ObjectId(campaignId) } },
        {
            $lookup: {
                from: 'students',
                localField: 'studentId',
                foreignField: '_id',
                as: 'student'
            }
        },
        { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } }, 
        {
            $lookup: {
                from: 'classes',
                localField: 'student.classId',
                foreignField: '_id',
                as: 'student.class'
            }
        },
        { $unwind: { path: '$student.class', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                students: {
                    $push: {
                        studentName: '$student.fullName',
                        className: '$student.class.className',
                        reason: '$reasonForDeclining',
                    }
                }
            }
        }
    ]);

    type ReportType = {
        campaignInfo: any;
        summary: any;
        detailedLists: {
            [key: string]: any[]; 
        };
    };

    const report: ReportType = {
        campaignInfo: {
            name: campaignInfo.name,
            vaccineName: campaignInfo.vaccineName,
            startDate: campaignInfo.startDate,
            endDate: campaignInfo.endDate,
        },
        summary: campaignInfo.summary,
        detailedLists: {}
    };

    consentAggregation.forEach(group => {
        report.detailedLists[`${group._id.toLowerCase()}List`] = group.students;
    });

    return report;
  }


   public async getDashboardStats(schoolYear: string): Promise<any> {
    const activeCampaignsCountPromise = VaccinationCampaignModel.countDocuments({
      status: 'IN_PROGRESS',
      schoolYear: schoolYear,
    });

    const totalAdministeredPromise = VaccinationCampaignModel.aggregate([
      { $match: { schoolYear: schoolYear } },
      {
        $group: {
          _id: null,
          total: { $sum: '$summary.administered' },
        },
      },
    ]);

    const nextCampaignPromise = VaccinationCampaignModel.findOne({
      status: { $in: ['ANNOUNCED', 'IN_PROGRESS'] },
      startDate: { $gte: new Date() },
    }).sort({ startDate: 1 });

    const vaccinationRatePromise = StudentModel.aggregate([

      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'classInfo',
        },
      },
      { $unwind: '$classInfo' },
      

      {
        $group: {
          _id: '$classInfo.gradeLevel', 
          totalStudents: { $sum: 1 },
          studentIds: { $push: '$_id' } 
        }
      },

      {
        $lookup: {
          from: 'vaccinationrecords',
          let: { studentIdsInGrade: '$studentIds' }, 
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$studentId', '$$studentIdsInGrade'] 
                }
              }
            }
          ],
          as: 'vaccinationData'
        }
      },
      
    
      {
        $project: {
          _id: 0,
          grade: '$_id',
          totalStudents: '$totalStudents',
          totalAdministered: { $size: '$vaccinationData' },
          rate: {
            $cond: [ // Dùng $cond để tránh lỗi chia cho 0
              { $eq: ['$totalStudents', 0] },
              0, // Nếu totalStudents = 0, rate = 0
              { $divide: [{ $size: '$vaccinationData' }, '$totalStudents'] } 
            ]
          }
        }
      },
      { $sort: { grade: 1 } } 
    ]);
    
    const [
      activeCampaignsCount,
      totalAdministeredResult,
      nextCampaign,
      vaccinationRateByGrade, 
    ] = await Promise.all([
      activeCampaignsCountPromise,
      totalAdministeredPromise,
      nextCampaignPromise,
      vaccinationRatePromise,
    ]);

    const totalAdministered = totalAdministeredResult.length > 0 ? totalAdministeredResult[0].total : 0;

    return {
      activeCampaignsCount,
      totalAdministeredThisYear: totalAdministered,
      nextCampaignDate: nextCampaign ? nextCampaign.startDate : null,
      vaccinationRateByGrade, 
    };
  }
}