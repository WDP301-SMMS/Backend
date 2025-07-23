import mongoose from 'mongoose';
import { ConsentStatus } from '@/enums/ConsentsEnum';
import { IVaccinationCampaign } from '@/interfaces/vaccination.campaign.interface';
import {
  IObservation,
  IVaccinationRecord,
} from '@/interfaces/vacination.record.interface';
import { VaccinationCampaignModel } from '@/models/vaccination.campaign.model';
import { VaccinationConsentModel } from '@/models/vaccination.consent.model';
import { AppError } from '@/utils/globalErrorHandler';
import { VaccinationRecordModel } from '@/models/vacination.record.model';
import { sendVaccinationRecordNotification } from '@/utils/notification.helper';
import MedicalIncidentService from '../incident/incident.service';
import { IncidentSeverity } from '@/enums/IncidentEnum';

interface ICreateRecordPayload {
  consentId: string;
  administeredAt: Date;
  administeredByStaffId: string;
}

export class VaccinationRecordService {
  public async getRegistrants(campaignId: string): Promise<any> {
    const campaign = await VaccinationCampaignModel.findById(campaignId);
    if (!campaign) {
      const error: AppError = new Error('Campaign not found.');
      error.status = 404;
      throw error;
    }

    const registrants = await VaccinationConsentModel.aggregate([
      {
        $match: {
          campaignId: new mongoose.Types.ObjectId(campaignId),
          status: ConsentStatus.APPROVED,
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      { $unwind: '$studentInfo' },
      {
        $lookup: {
          from: 'classes',
          localField: 'studentInfo.classId',
          foreignField: '_id',
          as: 'classInfo',
        },
      },
      { $unwind: '$classInfo' },
      {
        $sort: {
          'classInfo.className': 1,
          'studentInfo.fullName': 1,
        },
      },
      {
        $project: {
          _id: 0,
          consentId: '$_id',
          studentId: '$studentInfo._id',
          fullName: '$studentInfo.fullName',
          dateOfBirth: '$studentInfo.dateOfBirth',
          className: '$classInfo.className',
        },
      },
    ]);

    return registrants;
  }

  public async getMedicalChecklist(campaignId: string): Promise<any> {
    const checklist = await VaccinationConsentModel.aggregate([
      {
        $match: {
          campaignId: new mongoose.Types.ObjectId(campaignId),
          status: {
            $in: [
              ConsentStatus.APPROVED,
              ConsentStatus.COMPLETED,
              ConsentStatus.UNDER_OBSERVATION,
              ConsentStatus.ADVERSE_REACTION,
              ConsentStatus.REVOKED,
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      { $unwind: '$studentInfo' },
      {
        $lookup: {
          from: 'classes',
          localField: 'studentInfo.classId',
          foreignField: '_id',
          as: 'classInfo',
        },
      },
      { $unwind: '$classInfo' },
      {
        $lookup: {
          from: 'healthprofiles',
          localField: 'studentId',
          foreignField: 'studentId',
          as: 'healthProfile',
        },
      },
      { $unwind: { path: '$healthProfile', preserveNullAndEmptyArrays: true } },
      {
        $sort: { 'classInfo.className': 1, 'studentInfo.fullName': 1 },
      },
      {
        $project: {
          _id: 0,
          consentId: '$_id',
          studentId: '$studentInfo._id',
          fullName: '$studentInfo.fullName',
          dateOfBirth: '$studentInfo.dateOfBirth',
          className: '$classInfo.className',
          allergies: {
            $ifNull: ['$healthProfile.allergies', 'Chưa có thông tin'],
          },
          chronicConditions: {
            $ifNull: ['$healthProfile.chronicConditions', 'Chưa có thông tin'],
          },
          vaccinationStatus: {
            $cond: {
              if: { $eq: ['$status', ConsentStatus.APPROVED] },
              then: 'PENDING_VACCINATION',
              else: '$status',
            },
          },
        },
      },
    ]);
    return checklist;
  }

  public async createVaccinationRecord(
    payload: ICreateRecordPayload,
  ): Promise<IVaccinationRecord> {
    const { consentId, administeredAt, administeredByStaffId } = payload;

    try {
      const consent = await VaccinationConsentModel.findById(
        consentId,
      ).populate<{ campaignId: IVaccinationCampaign }>('campaignId');

      if (!consent) {
        const error: AppError = new Error('Consent form not found.');
        error.status = 404;
        throw error;
      }
      if (consent.status !== ConsentStatus.APPROVED) {
        const error: AppError = new Error(
          `Cannot create record. Consent status is '${consent.status}', not 'APPROVED'.`,
        );
        error.status = 409;
        throw error;
      }

      const campaign = consent.campaignId;

      const newRecord = new VaccinationRecordModel({
        consentId,
        studentId: consent.studentId,
        partnerId: campaign.partnerId,
        administeredByStaffId,
        administeredAt,
        vaccineName: campaign.vaccineName,
        doseNumber: campaign.doseNumber,
      });

      await newRecord.save();

      consent.status = ConsentStatus.UNDER_OBSERVATION;
      await consent.save();

      await VaccinationCampaignModel.updateOne(
        { _id: campaign._id },
        { $inc: { 'summary.administered': 1 } },
      );

      return newRecord;
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 11000
      ) {
        const appError: AppError = new Error(
          'A vaccination record for this consent form already exists.',
        );
        appError.status = 409;
        throw appError;
      }
      throw error;
    }
  }

  // public async addObservation(
  //   consentId: string,
  //   observationData: IObservation,
  // ): Promise<IVaccinationRecord> {
  //   const updatedRecord = await VaccinationRecordModel.findOneAndUpdate(
  //     { consentId: consentId },
  //     { $push: { postVaccinationChecks: observationData } },
  //     { new: true, runValidators: true },
  //   );

  //   if (!updatedRecord) {
  //     const error: AppError = new Error(
  //       'Vaccination record associated with this consent ID not found.',
  //     );
  //     error.status = 404;
  //     throw error;
  //   }

  //   const newStatus = observationData.isAbnormal
  //     ? ConsentStatus.ADVERSE_REACTION
  //     : ConsentStatus.COMPLETED;

  //   await VaccinationConsentModel.findByIdAndUpdate(consentId, {
  //     status: newStatus,
  //   });

  //   return updatedRecord;
  // }
  public async addObservation(
    consentId: string,
    observationData: IObservation,
    nurseId: string,
  ): Promise<IVaccinationRecord> {
    const updatedRecord = await VaccinationRecordModel.findOneAndUpdate(
      { consentId: consentId },
      { $push: { postVaccinationChecks: observationData } },
      { new: true, runValidators: true },
    );

    if (!updatedRecord) {
      const error: AppError = new Error(
        'Vaccination record associated with this consent ID not found.',
      );
      error.status = 404;
      throw error;
    }

    const newStatus = observationData.isAbnormal
      ? ConsentStatus.ADVERSE_REACTION
      : ConsentStatus.COMPLETED;

    await VaccinationConsentModel.findByIdAndUpdate(consentId, {
      status: newStatus,
    });


    if (newStatus === ConsentStatus.ADVERSE_REACTION) {
      console.log(`[Event] Adverse reaction detected for consent ${consentId}. Creating medical incident.`);

      const incidentService = new MedicalIncidentService();

      const incidentPayload = {
        studentId: updatedRecord.studentId,
        nurseId: nurseId,
        incidentType: 'Phản ứng sau tiêm',
        description: observationData.notes || 'Học sinh có phản ứng bất lợi sau khi tiêm chủng.',
        severity: IncidentSeverity.Critical, // Mặc định
        actionsTaken: observationData.actionsTaken || 'Ghi nhận phản ứng và đang theo dõi.',
        incidentTime: observationData.observedAt,
      };

      incidentService.createIncident(incidentPayload).catch(err => {
        console.error(`[Error] Failed to auto-create incident for consent ${consentId}:`, err);
      });
    } else {
      if (updatedRecord) {
        sendVaccinationRecordNotification(updatedRecord);
      }
    }

    return updatedRecord;
  }
}

