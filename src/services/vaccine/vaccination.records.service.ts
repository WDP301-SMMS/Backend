import mongoose from 'mongoose';
import { ConsentStatus } from '@/enums/ConsentsEnum';
import { IVaccinationCampaign } from '@/interfaces/vaccination.campaign.interface';
import { IObservation, IVaccinationRecord } from '@/interfaces/vacination.record.interface';
import { VaccinationCampaignModel } from '@/models/vaccination.campaign.model';
import { VaccinationConsentModel } from '@/models/vaccination.consent.model';
import { AppError } from '@/utils/globalErrorHandler';
import { VaccinationRecordModel } from '@/models/vacination.record.model';

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

    public async createVaccinationRecord(payload: ICreateRecordPayload): Promise<IVaccinationRecord> {
        const { consentId, administeredAt, administeredByStaffId } = payload;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const consent = await VaccinationConsentModel.findById(consentId)
                .populate<{ campaignId: IVaccinationCampaign }>('campaignId')
                .session(session);

            if (!consent) {
                const error: AppError = new Error('Consent form not found.');
                error.status = 404;
                throw error;
            }
            if (consent.status !== ConsentStatus.APPROVED) {
                const error: AppError = new Error(`Cannot create record. Consent status is '${consent.status}', not 'APPROVED'.`);
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

            await newRecord.save({ session });

            consent.status = ConsentStatus.COMPLETED;
            await consent.save({ session });

            await VaccinationCampaignModel.updateOne(
                { _id: campaign._id },
                { $inc: { 'summary.administered': 1 } }
            ).session(session);

            await session.commitTransaction();
            return newRecord;
        } catch (error) {
            await session.abortTransaction();
            if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
                const appError: AppError = new Error('A vaccination record for this consent form already exists.');
                appError.status = 409;
                throw appError;
            }
            throw error ;
        } finally {
            session.endSession();
        }
    }

    public async addObservation(recordId: string, observationData: IObservation): Promise<IVaccinationRecord> {
        const updatedRecord = await VaccinationRecordModel.findByIdAndUpdate(
            recordId,
            { $push: { postVaccinationChecks: observationData } },
            { new: true }
        );

        if (!updatedRecord) {
            const error: AppError = new Error('Vaccination record not found.');
            error.status = 404;
            throw error;
        }

        return updatedRecord;
    }
}