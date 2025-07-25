
import { VaccinationRecordService } from '@/services/vaccine/vaccination.records.service';
import { Request, Response, NextFunction } from 'express';

const recordService = new VaccinationRecordService();

export class VaccinationRecordController {
  public getRegistrants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { campaignId } = req.params;
      const registrants = await recordService.getRegistrants(campaignId);

      res.status(200).json({
        success: true,
        message: 'Registrants list retrieved successfully.',
        data: registrants,
      });
    } catch (error) {
      next(error);
    }
  };

  public getMedicalChecklist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { campaignId } = req.params;
      const checklist = await recordService.getMedicalChecklist(campaignId);

      res.status(200).json({
        success: true,
        message: 'Medical checklist retrieved successfully.',
        data: checklist,
      });
    } catch (error) {
      next(error);
    }
  };

  public createVaccinationRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newRecord = await recordService.createVaccinationRecord(req.body);

      res.status(201).json({
        success: true,
        message: 'Vaccination record created successfully.',
        data: newRecord,
      });
    } catch (error) {
      next(error);
    }
  };

  public addObservation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { consentId } = req.params;
      const nurseId = req.user!._id!.toString();
      const updatedRecord = await recordService.addObservation(consentId, req.body, nurseId);

      res.status(200).json({
        success: true,
        message: 'Observation added successfully.',
        data: updatedRecord,
      });
    } catch (error) {
      next(error);
    }
  };
}