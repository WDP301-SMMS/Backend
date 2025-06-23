import { IUser } from '@/interfaces/user.interface';
import { VaccinationCampaignService } from '@/services/vaccine/vaccination.campaigns.service';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    export interface Request {
      user?: IUser;
    }
  }
}

const campaignService = new VaccinationCampaignService();

export class VaccinationCampaignController {

    public createCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const createdByUserId = req.user?._id || req.body.createdBy;
            if (!createdByUserId) {
                throw new Error('userId is required (Manager)');
            }

            const newCampaign = await campaignService.createCampaign(req.body, createdByUserId);

            res.status(201).json({
                success: true,
                message: 'Campaign created successfully.',
                data: newCampaign
            });
        } catch (error) {
            next(error);
        }
    };


    public dispatchCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { campaignId } = req.params;
            const result = await campaignService.dispatchCampaign(campaignId);

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    };


    public updateCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { campaignId } = req.params;
             const userId = req.user?._id || req.body.createdBy;
            if (!userId) {
                throw new Error('userId is required (Nurse)');
            }

            const updatedCampaign = await campaignService.updateCampaign(campaignId, req.body, userId);

            res.status(200).json({
                success: true,
                message: 'Campaign updated successfully.',
                data: updatedCampaign
            });
        } catch (error) {
            next(error);
        }
    };

    public getAllCampaigns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {

            const result = await campaignService.getAllCampaigns(req.query);

            res.status(200).json({
                success: true,
                message: 'Campaigns retrieved successfully.',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    };

    public getCampaignById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { campaignId } = req.params;
            const campaign = await campaignService.getCampaignById(campaignId);

            res.status(200).json({
                success: true,
                message: 'Campaign details retrieved successfully.',
                data: campaign
            });
        } catch (error) {
            next(error);
        }
    };
}