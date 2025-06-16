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


export default router;