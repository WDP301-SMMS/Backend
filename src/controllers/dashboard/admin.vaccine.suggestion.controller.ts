import AdminVaccineSuggestionService from '@/services/admin.vaccine.suggestion.service';
import { NextFunction, Request, Response } from 'express';


const adminVaccineSuggestionService = new AdminVaccineSuggestionService();

/**
 * @description Handler cho route GET /api/admin/vaccines/suggestions
 *              Lấy danh sách các tên vaccine đã từng được sử dụng để gợi ý.
 */
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