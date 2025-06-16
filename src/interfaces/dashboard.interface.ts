// Interface cho các con số tổng quan
export interface IQuickStats {
    totalStudents: number;
    incidentsThisWeek: number;
    pendingMedicationRequests: number;
    inventoryAlerts: number;
}

// Interface cho một mục trong biểu đồ phân loại sức khỏe
export interface IHealthClassificationItem {
    classification: string;
    count: number;
}

// Interface cho một mục trong biểu đồ các vấn đề phổ biến
export interface ICommonIssueItem {
    issue: string;
    studentCount: number;
}

// Interface cho một điểm dữ liệu trong biểu đồ xu hướng BMI
export interface IBmiTrendItem {
    schoolYear: string;
    averageBmi: number;
}

// Interface cho widget Phân tích Sức khỏe
export interface IHealthAnalytics {
    healthClassification: IHealthClassificationItem[];
    commonIssues: ICommonIssueItem[];
    bmiTrend: IBmiTrendItem[];
}

// Interface cho widget Giám sát Hoạt động
export interface IOperationalMonitoring {
    latestCampaignStatus: any; // Định nghĩa chi tiết hơn nếu cần
    recentIncidents: any[];
}

// Interface cho toàn bộ dữ liệu Dashboard
export interface IDashboardData {
    quickStats: IQuickStats;
    healthAnalytics: IHealthAnalytics;
    operationalMonitoring: IOperationalMonitoring;
}