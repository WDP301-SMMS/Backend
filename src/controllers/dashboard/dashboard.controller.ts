import { DashboardService } from '@/services/dashboard.service';
import { Request, Response, NextFunction } from 'express';


export class DashboardController {
    /**
     * API chính cho Dashboard của Admin
     */
    public static async getAdminDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Chỉ cần gọi một hàm duy nhất từ Service
            const dashboardData = await DashboardService.getAdminDashboardData();

            res.status(200).json({
                message: "Lấy dữ liệu dashboard thành công!",
                data: dashboardData
            });

        } catch (error) {
            // Chuyển lỗi cho middleware xử lý lỗi trung gian
            next(error); 
        }
    }
}