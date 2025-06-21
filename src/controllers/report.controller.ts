import { ReportService } from '@/services/report.service';
import { Request, Response, NextFunction } from 'express';
import { IUser } from '@/interfaces/user.interface';

declare global {
    namespace Express {
        export interface Request {
            user?: IUser;
        }
    }
}

const reportService = new ReportService();

export class ReportController {
    public getStudentVaccinationHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { studentId } = req.params;


            const history = await reportService.getStudentVaccinationHistory(studentId);

            res.status(200).json({
                success: true,
                message: 'Student vaccination history retrieved successfully.',
                data: history,
            });
        } catch (error) {
            next(error);
        }
    };

    public getCampaignFullReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { campaignId } = req.params;
            const report = await reportService.getCampaignFullReport(campaignId);

            res.status(200).json({
                success: true,
                message: 'Campaign full report retrieved successfully.',
                data: report,
            });
        } catch (error) {
            next(error);
        }
    };

    public getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {

            const schoolYear = (req.query.schoolYear as string) || this.getCurrentSchoolYear();

            const stats = await reportService.getDashboardStats(schoolYear);

            res.status(200).json({
                success: true,
                message: 'Dashboard statistics retrieved successfully.',
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    };


    private getCurrentSchoolYear(): string {
        const now = new Date();
        const currentYear = now.getFullYear();
        const month = now.getMonth();


        if (month >= 7) {
            return `${currentYear}-${currentYear + 1}`;
        } else {
            return `${currentYear - 1}-${currentYear}`;
        }
    }
}