import mongoose from 'mongoose';
import { CampaignStatus } from '@/enums/CampaignEnum';
import { IVaccinationCampaign } from '@/interfaces/vaccination.campaign.interface';
import { Class } from '@/models/class.model';
import { HealthcareOrganization } from '@/models/healthcare.organizations.model';
import { StudentModel } from '@/models/student.model';
import { VaccinationCampaignModel } from '@/models/vaccination.campaign.model';
import { VaccinationConsentModel } from '@/models/vaccination.consent.model';
import { AppError } from '@/utils/globalErrorHandler';
import { ConsentStatus } from '@/enums/ConsentsEnum';


type CreateCampaignInput = Pick<
  IVaccinationCampaign,
  'name' | 'vaccineName' | 'doseNumber' | 'partnerId' | 'targetGradeLevels' | 'startDate' | 'endDate' | 'description' | 'schoolYear'
>;

type UpdateCampaignInput = Partial<
  Pick<IVaccinationCampaign, 'name' | 'description' | 'status' | 'cancellationReason'>
>;

export class VaccinationCampaignService {
  public async createCampaign(campaignData: CreateCampaignInput, createdByUserId: string): Promise<IVaccinationCampaign> {
    const partner = await HealthcareOrganization.findById(campaignData.partnerId);
    if (!partner || !partner.isActive) {
      const error: AppError = new Error('Partner not found or is inactive.');
      error.status = 400;
      throw error;
    }

    const newCampaign = new VaccinationCampaignModel({
      ...campaignData,
      status: CampaignStatus.DRAFT,
      createdBy: createdByUserId,
    });

    await newCampaign.save();
    return newCampaign.populate([{ path: 'partnerId', select: 'name' }, { path: 'createdBy', select: 'username email' }]);
  }

  public async dispatchCampaign(campaignId: string): Promise<{ message: string }> {
    // const session = await mongoose.startSession();
    // session.startTransaction();
    try {
      const campaign = await VaccinationCampaignModel.findById(campaignId)
      // .session(session);
      if (!campaign) {
        const error: AppError = new Error('Campaign not found.');
        error.status = 404;
        throw error;
      }
      if (campaign.status !== CampaignStatus.DRAFT) {
        const error: AppError = new Error('Only DRAFT campaigns can be dispatched.');
        error.status = 409;
        throw error;
      }

      const targetClasses = await Class.find({ gradeLevel: { $in: campaign.targetGradeLevels } }).select('_id')
      // .session(session);
      if (targetClasses.length === 0) {
        const error: AppError = new Error(`No classes found for the target grade levels [${campaign.targetGradeLevels.join(', ')}]. Please check campaign settings or class data.`);
        error.status = 404; // Not Found
        throw error;
      }
      const targetClassIds = targetClasses.map(c => c._id);
      const students = await StudentModel.find({ classId: { $in: targetClassIds } }).select('parentId')
      // .session(session);

       if (students.length === 0) {
        const error: AppError = new Error('No students found for the target classes. Consent forms were not created.');
        error.status = 404; // Not Found
        throw error;
      }
      
      let createdCount = 0;
      if (students.length > 0) {
        const consentsToCreate = students.map(student => ({
          campaignId: campaign._id, studentId: student._id, parentId: student.parentId, status: 'PENDING',
        }));
        // const result = await VaccinationConsentModel.insertMany(consentsToCreate, { session });
        const result = await VaccinationConsentModel.insertMany(consentsToCreate);
        createdCount = result.length;
      }

      campaign.status = CampaignStatus.ANNOUNCED;
      campaign.dispatchedAt = new Date();
      campaign.summary.totalStudents = students.length;
      campaign.summary.totalConsents = createdCount;

      await campaign.save();
      // await campaign.save({ session });
      // await session.commitTransaction();

      return { message: `Campaign dispatched successfully. ${createdCount} consent forms created.` };
    } catch (error) {
      // await session.abortTransaction();
      throw error;
    }
    // } finally {
    //   session.endSession();
    // }
  }

  public async updateCampaign(campaignId: string, updateData: UpdateCampaignInput, userId: string): Promise<IVaccinationCampaign> {
    const campaign = await VaccinationCampaignModel.findById(campaignId);
    if (!campaign) {
      const error: AppError = new Error('Campaign not found.');
      error.status = 404;
      throw error;
    }

    const currentStatus = campaign.status as CampaignStatus;
    const newStatus = updateData.status;

    if (newStatus && newStatus !== currentStatus) {
      this.validateStateTransition(currentStatus, newStatus);
      if (newStatus === CampaignStatus.CANCELED) {
        if (!updateData.cancellationReason) {
          const error: AppError = new Error('Cancellation reason is required.');
          error.status = 400;
          throw error;
        }

        campaign.cancellationReason = updateData.cancellationReason;
        campaign.canceledBy = new mongoose.Types.ObjectId(userId);
        campaign.cancellationDate = new Date();

        if (currentStatus === CampaignStatus.ANNOUNCED || currentStatus === CampaignStatus.IN_PROGRESS) {
          await VaccinationConsentModel.updateMany(
            { campaignId: campaign._id },
            { $set: { status: ConsentStatus.DECLINED } }
          );
        }
      }

      if (newStatus === CampaignStatus.COMPLETED) {
        campaign.completedAt = new Date();
      }


      campaign.status = newStatus;
    }
    if (currentStatus === CampaignStatus.DRAFT) {
      if (updateData.name) campaign.name = updateData.name;
      if (updateData.description) campaign.description = updateData.description;
    } else if (updateData.name || updateData.description) {
      const error: AppError = new Error(`Cannot update campaign details with status ${currentStatus}.`);
      error.status = 409;
      throw error;
    }

    await campaign.save();
    return campaign;
  }

  private validateStateTransition(current: CampaignStatus, next: CampaignStatus): void {
    const allowedInPatch: Record<CampaignStatus, CampaignStatus[]> = {
      [CampaignStatus.DRAFT]: [CampaignStatus.CANCELED],
      [CampaignStatus.ANNOUNCED]: [CampaignStatus.CANCELED],
      [CampaignStatus.IN_PROGRESS]: [CampaignStatus.COMPLETED, CampaignStatus.CANCELED],
      [CampaignStatus.COMPLETED]: [],
      [CampaignStatus.CANCELED]: [],
    };
    if (!allowedInPatch[current] || !allowedInPatch[current].includes(next)) {
      const error: AppError = new Error(`Action invalid: Cannot transition campaign from ${current} to ${next}.`);
      error.status = 409;
      throw error;
    }
  }

  public async getAllCampaigns(queryParams: any): Promise<any> {
    const { page = 1, limit = 10, status, partnerId, schoolYear } = queryParams;
    const filter: any = {};
    if (status) filter.status = status;
    if (partnerId) filter.partnerId = partnerId;
    if (schoolYear) filter.schoolYear = schoolYear;

    const campaigns = await VaccinationCampaignModel.find(filter)
      .populate('partnerId', 'name')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await VaccinationCampaignModel.countDocuments(filter);

    return {
      data: campaigns,
      pagination: { totalPages: Math.ceil(count / limit), currentPage: parseInt(page, 10), totalItems: count },
    };
  }

  public async getCampaignById(campaignId: string): Promise<IVaccinationCampaign> {
    const campaign = await VaccinationCampaignModel.findById(campaignId)
      .populate('partnerId', 'name address phone')
      .populate({ path: 'createdBy', model: 'User', select: 'username email' });
    if (!campaign) {
      const error: AppError = new Error('Campaign not found.');
      error.status = 404;
      throw error;
    }
    return campaign;
  }
}