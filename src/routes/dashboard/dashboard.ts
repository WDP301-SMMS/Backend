import { AdminClassController } from "@/controllers/dashboard/admin.classes.controller";
import AdminUserStudentController from "@/controllers/dashboard/admin.users.controller";
import { DashboardController } from "@/controllers/dashboard/dashboard.controller";

const express = require('express');


const router = express.Router();
const adminController = new AdminUserStudentController();


// GET ALL DATA /api/admin/dashboard
router.get('/dashboard', DashboardController.getAdminDashboard);


// ROUTES CHO USER
// GET /api/admin/users
router.get(
    '/users',
    // authMiddleware, adminOnlyMiddleware,
    adminController.getUsers
);

// PATCH /api/admin/users/:userId/status
router.patch(
    '/users/:userId/status',
    // authMiddleware, adminOnlyMiddleware,
    adminController.updateUserStatus
);


// ROUTE CHO STUDENTS
// GET /api/admin/students
router.get(
    '/students',
    // authMiddleware, adminOnlyMiddleware,
    adminController.getStudents
);

// POST /api/admin/students
router.post(
    '/students',
    // authMiddleware, adminOnlyMiddleware,
    adminController.createStudent
);

// PUT /api/admin/students/:studentId
router.put(
    '/students/:studentId',
    // authMiddleware, adminOnlyMiddleware,
    adminController.updateStudent
);


//ROUTES CHO QUẢN LÝ LỚP HỌC
// GET /api/admin/classes
// Lấy danh sách lớp, hỗ trợ lọc và phân trang
// Ví dụ: /api/admin/classes?schoolYear=2024-2025&gradeLevel=1
router.get(
    '/classes',
    AdminClassController.getClasses
);

// POST /api/admin/classes
// Tạo một lớp học mới
router.post(
    '/classes',
    AdminClassController.createClass
);

// PATCH /api/admin/classes/:classId/add-students
// Thêm học sinh vào một lớp
router.patch(
    '/classes/:classId/add-students',
    AdminClassController.addStudentsToClass
);

// PATCH /api/admin/classes/:classId/remove-students
// Xóa học sinh khỏi một lớp
router.patch(
    '/classes/:classId/remove-students',
    AdminClassController.removeStudentsFromClass
);


export default router;