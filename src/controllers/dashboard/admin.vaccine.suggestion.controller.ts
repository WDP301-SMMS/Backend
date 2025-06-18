import AdminVaccineSuggestionService from '@/services/admin.vaccine.suggestion.service';
import { NextFunction, Request, Response } from 'express';


const adminVaccineSuggestionService = new AdminVaccineSuggestionService();
const getVaccineSuggestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const suggestions = await adminVaccineSuggestionService.getVaccineSuggestions();
    res.status(200).json({ data: suggestions, message: 'Vaccine suggestions retrieved successfully' });
  } catch (error) {
    next(error);
  }
};

export const AdminVaccineSuggestionController = {
  getVaccineSuggestions,
};