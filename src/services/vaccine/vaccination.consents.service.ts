import mongoose from 'mongoose';
import { CampaignStatus } from '@/enums/CampaignEnum';
import { ConsentStatus } from '@/enums/ConsentsEnum';
import { IVaccinationCampaign } from '@/interfaces/vaccination.campaign.interface';
import { IVaccinationConsent } from '@/interfaces/vaccination.consent.interface';
import { StudentModel } from '@/models/student.model';
import { VaccinationCampaignModel } from '@/models/vaccination.campaign.model';
import { VaccinationConsentModel } from '@/models/vaccination.consent.model';
import { AppError } from '@/utils/globalErrorHandler';

interface IConsentResponsePayload {
  status: ConsentStatus.APPROVED | ConsentStatus.DECLINED;
  reasonForDeclining?: string;
}

type PopulatedConsent = IVaccinationConsent & {
  campaignId: IVaccinationCampaign;
};

export class VaccinationConsentService {
  public async getMyConsents(parentId: string, status?: string): Promise<any> {
    const students = await StudentModel.find({ parentId: parentId }).select(
      '_id fullName',
    );
    if (students.length === 0) {
      return [];
    }

    const studentIds = students.map((s) => s._id);

    // Filter by status if valid
    const filter: any = {
      studentId: { $in: studentIds },
    };

    if (
      status &&
      Object.values(ConsentStatus).includes(
        status.toUpperCase() as ConsentStatus,
      )
    ) {
      filter.status = status.toUpperCase();
    }

    const consents = await VaccinationConsentModel.find(filter)
      .populate<{ campaignId: IVaccinationCampaign }>({
        path: 'campaignId',
        select: 'name vaccineName doseNumber startDate endDate description',
      })
      .sort({ createdAt: -1 });

    const resultsByStudent: Record<
      string,
      {
        studentId: string;
        studentName: string;
        consents: (Omit<IVaccinationConsent, 'campaignId'> & {
          campaignId: IVaccinationCampaign;
        })[];
      }
    > = {};

    for (const student of students) {
      resultsByStudent[student._id.toString()] = {
        studentId: student._id.toString(),
        studentName: student.fullName,
        consents: [],
      };
    }

    for (const consent of consents) {
      const studentId = consent.studentId?.toString();
      if (studentId && resultsByStudent[studentId]) {
        resultsByStudent[studentId].consents.push(consent);
      }
    }

    return Object.values(resultsByStudent);
  }

  public async getConsentById(consentId: string): Promise<{
    studentId: string;
    studentName: string;
    consents: (Omit<IVaccinationConsent, 'campaignId'> & {
      campaignId: IVaccinationCampaign;
    })[];
  }> {
    const consent = await VaccinationConsentModel.findById(consentId).populate<{
      campaignId: IVaccinationCampaign;
    }>({
      path: 'campaignId',
      select:
        'name vaccineName doseNumber startDate endDate description status',
    });

    if (!consent) {
      const error: AppError = new Error('Consent not found.');
      error.status = 404;
      throw error;
    }

    const student = await StudentModel.findById(consent.studentId).select(
      '_id fullName',
    );
    if (!student) {
      const error: AppError = new Error('Student not found.');
      error.status = 404;
      throw error;
    }

    const result = {
      studentId: student._id.toString(),
      studentName: student.fullName,
      consents: [
        consent as Omit<IVaccinationConsent, 'campaignId'> & {
          campaignId: IVaccinationCampaign;
        },
      ],
    };

    return result;
  }

  // public async respondToConsent(
  //     consentId: string,
  //     parentId: string,
  //     payload: IConsentResponsePayload
  // ): Promise<PopulatedConsent> {

  //     const session = await mongoose.startSession();
  //     session.startTransaction();
  //     try {
  //         const consent = await VaccinationConsentModel.findById(consentId)
  //             .populate<Pick<PopulatedConsent, 'campaignId'>>('campaignId')
  //             .session(session);

  //         if (!consent) {
  //             const error: AppError = new Error('Consent request not found.');
  //             error.status = 404;
  //             throw error;
  //         }

  //         if (!consent.parentId.equals(parentId)) {
  //             const error: AppError = new Error('You are not authorized to respond to this request.');
  //             error.status = 403;
  //             throw error;
  //         }

  //         if (consent.status !== ConsentStatus.PENDING) {
  //             const error: AppError = new Error('This consent request has already been responded to.');
  //             error.status = 409;
  //             throw error;
  //         }

  //         const campaign = consent.campaignId as IVaccinationCampaign;
  //         if (campaign.status !== CampaignStatus.ANNOUNCED) {
  //             const error: AppError = new Error('This campaign is not active or has been canceled.');
  //             error.status = 403;
  //             throw error;
  //         }

  //         if (new Date() > campaign.endDate) {
  //             const error: AppError = new Error('The deadline for responding to this campaign has passed.');
  //             error.status = 403;
  //             throw error;
  //         }

  //         const oldStatus = consent.status;
  //         consent.status = payload.status;
  //         consent.confirmedAt = new Date();

  //         if (payload.status === ConsentStatus.DECLINED) {
  //             consent.reasonForDeclining = payload.reasonForDeclining || 'No reason provided.';
  //         } else {
  //             consent.reasonForDeclining = undefined;
  //         }

  //         type MongooseUpdatePayload = {
  //             $inc: { [key: string]: number };
  //         };
  //         const summaryUpdate: MongooseUpdatePayload = { $inc: {} };

  //         if (oldStatus === ConsentStatus.PENDING) {
  //             summaryUpdate.$inc['summary.approved'] = payload.status === ConsentStatus.APPROVED ? 1 : 0;
  //             summaryUpdate.$inc['summary.declined'] = payload.status === ConsentStatus.DECLINED ? 1 : 0;
  //         }

  //         await VaccinationCampaignModel.updateOne({ _id: campaign._id }, summaryUpdate).session(session);

  //         await consent.save({ session });

  //         await session.commitTransaction();

  //         return consent as PopulatedConsent;

  //     } catch (error) {
  //         await session.abortTransaction();
  //         throw error;
  //     } finally {
  //         session.endSession();
  //     }
  // }

  // Trong file: services/vaccine/vaccination.consents.service.ts

  // ...

  public async respondByStudentAndCampaign(
    campaignId: string,
    studentId: string,
    parentId: string,
    payload: IConsentResponsePayload,
  ): Promise<IVaccinationConsent> {
    const consent = await VaccinationConsentModel.findOne({
      campaignId,
      studentId,
    });

    if (!consent) {
      const error: AppError = new Error(
        'Consent request not found for this student in this campaign.',
      );
      error.status = 404;
      throw error;
    }

    // Bước 2: Kiểm tra quyền sở hữu (bảo mật)
    const student = await StudentModel.findOne({
      _id: studentId,
      parentId: parentId,
    });
    if (!student) {
      const error: AppError = new Error(
        'You are not authorized to respond for this student.',
      );
      error.status = 403;
      throw error;
    }
    if (!consent.parentId.equals(parentId)) {
      const error: AppError = new Error(
        'Mismatched parent information. Access denied.',
      );
      error.status = 403;
      throw error;
    }

    const campaign = await VaccinationCampaignModel.findById(campaignId);
    if (!campaign) {
      const error: AppError = new Error('Campaign not found.');
      error.status = 404;
      throw error;
    }

    if (consent.status !== ConsentStatus.PENDING) {
      const error: AppError = new Error(
        'This consent request has already been responded to.',
      );
      error.status = 409;
      throw error;
    }
    if (campaign.status !== CampaignStatus.ANNOUNCED) {
      const error: AppError = new Error(
        'This campaign is not active or has been canceled.',
      );
      error.status = 403;
      throw error;
    }
    if (campaign.endDate && new Date() > campaign.endDate) {
      const error: AppError = new Error(
        'The deadline for responding to this campaign has passed.',
      );
      error.status = 403;
      throw error;
    }

    try {
      consent.status = payload.status;
      consent.confirmedAt = new Date();

      if (payload.status === ConsentStatus.DECLINED) {
        consent.reasonForDeclining =
          payload.reasonForDeclining || 'No reason provided.';
      } else {
        consent.reasonForDeclining = undefined;
      }

      await consent.save();
      const summaryUpdate = {
        $inc: {
          [`summary.${payload.status.toLowerCase()}`]: 1,
        },
      };
      await VaccinationCampaignModel.updateOne(
        { _id: campaignId },
        summaryUpdate,
      );

      return consent;
    } catch (error) {
      console.error(
        'INCONSISTENCY WARNING: An error occurred during a non-transactional update.',
        error,
      );
      throw error;
    }
  }

  public async getCampaignSummary(campaignId: string): Promise<any> {
    const campaign =
      await VaccinationCampaignModel.findById(campaignId).select('summary');
    if (!campaign) {
      const error: AppError = new Error('Campaign not found.');
      error.status = 404;
      throw error;
    }

    const { totalStudents = 0, approved = 0, declined = 0 } = campaign.summary;
    const pending = totalStudents - (approved + declined);

    return {
      total: totalStudents,
      approved,
      declined,
      pending: pending > 0 ? pending : 0,
    };
  }
}
