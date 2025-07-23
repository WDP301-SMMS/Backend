import { IUser } from '@/interfaces/user.interface';
import { VaccinationConsentService } from '@/services/vaccine/vaccination.consents.service';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    export interface Request {
      user?: IUser;
    }
  }
}

const consentService = new VaccinationConsentService();

export class VaccinationConsentController {
  public getMyConsents = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parentId = req.user?._id;
      if (!parentId) {
        throw new Error('User authentication error: User ID not found.');
      }

      const status = req.query.status as string | undefined;

      const consentsByStudent = await consentService.getMyConsents(
        parentId,
        status,
      );

      res.status(200).json({
        success: true,
        message: 'Consent requests retrieved successfully.',
        data: consentsByStudent,
      });
    } catch (error) {
      next(error);
    }
  };

  public getConsentById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { consentId } = req.params;

      const consentByStudent = await consentService.getConsentById(consentId);

      res.status(200).json({
        success: true,
        message: 'Consent retrieved successfully.',
        data: consentByStudent, // đồng nhất với getMyConsents
      });
    } catch (error) {
      next(error);
    }
  };

  public respondByStudentAndCampaign = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { campaignId, studentId } = req.params;
      const parentId = req.user?._id;
      if (!parentId) {
        throw new Error('User authentication error: User ID not found.');
      }

      const updatedConsent = await consentService.respondByStudentAndCampaign(
        campaignId,
        studentId,
        parentId,
        req.body,
      );

      res.status(200).json({
        success: true,
        message: 'Consent responded successfully.',
        data: updatedConsent,
      });
    } catch (error) {
      next(error);
    }
  };

  public getCampaignSummary = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { campaignId } = req.params;
      const summary = await consentService.getCampaignSummary(campaignId);

      res.status(200).json({
        success: true,
        message: 'Campaign summary retrieved successfully.',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  };
}
