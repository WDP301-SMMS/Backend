import { NextFunction, Request, Response } from 'express';

import { IUser } from '@/interfaces/user.interface';
import { HealthHistoryService } from '@/services/health-history/health.history.service';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

class HealthHistoryController {
  public healthHistoryService = new HealthHistoryService();

  public getStudentHealthHistory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { studentId } = req.params;
      const { schoolYear } = req.query as { schoolYear: string };
      const parentId = req.user!._id!.toString();

      const healthHistoryData =
        await this.healthHistoryService.getHealthHistoryBySchoolYear(
          studentId,
          schoolYear,
          parentId,
        );

      res
        .status(200)
        .json({ data: healthHistoryData, message: 'Health history retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default HealthHistoryController;