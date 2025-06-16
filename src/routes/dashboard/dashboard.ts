import { AdminClassController } from "@/controllers/dashboard/admin.classes.controller";
import { AdminHealthTemplateController } from "@/controllers/dashboard/admin.health.template.controller";
import { AdminPartnerController } from "@/controllers/dashboard/admin.partners.controller";
import AdminUserStudentController from "@/controllers/dashboard/admin.users.controller";
import { AdminVaccineSuggestionController } from "@/controllers/dashboard/admin.vaccine.suggestion.controller";
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
// Ví dụ: /api/admin/classes?schoolYear=2024-2025&gradeLevel=1
router.get(
    '/classes',
    AdminClassController.getClasses
);

// POST /api/admin/classes
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


// ROUTES CHO QUẢN LÝ MẪU KHÁM SỨC KHỎE
// GET /api/admin/health-check-templates
router.get(
    '/health-check-templates',
    AdminHealthTemplateController.getHealthCheckTemplates
);

// POST /api/admin/health-check-templates
router.post(
    '/health-check-templates',
    AdminHealthTemplateController.createHealthCheckTemplate
);

// GET /api/admin/health-check-templates/:templateId
router.get(
    '/health-check-templates/:templateId',
    AdminHealthTemplateController.getHealthCheckTemplateById
);

// PUT /api/admin/health-check-templates/:templateId
router.put(
    '/health-check-templates/:templateId',
    AdminHealthTemplateController.updateHealthCheckTemplate
);

// DELETE /api/admin/health-check-templates/:templateId
router.delete(
    '/health-check-templates/:templateId',
    AdminHealthTemplateController.deleteHealthCheckTemplate
);



// ROUTE CHO GỢI Ý TÊN VACCINE
// GET /api/admin/vaccines/suggestions
router.get(
    '/vaccines/suggestions',
    AdminVaccineSuggestionController.getVaccineSuggestions
);



//ROUTES CHO QUẢN LÝ ĐỐI TÁC Y TẾ

router.get('/partners', AdminPartnerController.getPartners);
router.post('/partners', AdminPartnerController.createPartner);
router.get('/partners/:partnerId', AdminPartnerController.getPartnerById);
router.put('/partners/:partnerId', AdminPartnerController.updatePartner);
router.delete('/partners/:partnerId', AdminPartnerController.deletePartner);



export default router;