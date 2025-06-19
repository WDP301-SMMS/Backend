
import { DashboardService } from '@/services/dashboard.service';
import { Request, Response, NextFunction } from 'express';


export class DashboardController {
    public static async getAdminDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dashboardData = await DashboardService.getAdminDashboardData();
            res.status(200).json({
                message: "Lấy dữ liệu dashboard thành công!",
                data: dashboardData
            });

        } catch (error) {
            next(error); 
        }
    }
}