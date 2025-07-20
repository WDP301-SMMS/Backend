import { AdminClassController } from "@/controllers/dashboard/admin.classes.controller";
import { AdminHealthTemplateController } from "@/controllers/dashboard/admin.health.template.controller";
import { AdminInventoryViewerController } from "@/controllers/dashboard/admin.inventory.controller";
import { AdminPartnerController } from "@/controllers/dashboard/admin.partners.controller";
import AdminUserStudentController from "@/controllers/dashboard/admin.users.controller";
import { AdminVaccineSuggestionController } from "@/controllers/dashboard/admin.vaccine.suggestion.controller";
import { DashboardController } from "@/controllers/dashboard/dashboard.controller";
import { RoleEnum } from "@/enums/RoleEnum";
import { roleBaseAccess } from "@/middlewares/security/authorization";

const express = require('express');


const router = express.Router();
const adminController = new AdminUserStudentController();


// GET ALL DATA /api/admin/dashboard
router.get('/dashboard', DashboardController.getAdminDashboard);


// ROUTES CHO USER
router.get(
    '/users',
    // authMiddleware, adminOnlyMiddleware,
    roleBaseAccess([RoleEnum.Manager, RoleEnum.Nurse, RoleEnum.Parent]),
    adminController.getUsers
);
router.patch(
    '/users/:userId/status',
    // authMiddleware, adminOnlyMiddleware,
    adminController.updateUserStatus
);

// ROUTE CHO STUDENTS
router.get(
    '/students',
    // authMiddleware, adminOnlyMiddleware,
    adminController.getStudents
);

router.post(
    '/students',
    // authMiddleware, adminOnlyMiddleware,
    adminController.createStudent
);

router.put(
    '/students/:studentId',
    // authMiddleware, adminOnlyMiddleware,
    adminController.updateStudent
);


//ROUTES CHO QUẢN LÝ LỚP HỌC
router.get(
    '/classes',
    AdminClassController.getClasses
);

router.post(
    '/classes',
    AdminClassController.createClass
);

router.patch(
    '/classes/:classId/add-students',
    AdminClassController.addStudentsToClass
);

router.patch(
    '/classes/:classId/remove-students',
    AdminClassController.removeStudentsFromClass
);


// ROUTES CHO QUẢN LÝ MẪU KHÁM SỨC KHỎE
router.get(
    '/health-check-templates',
    AdminHealthTemplateController.getHealthCheckTemplates
);

router.post(
    '/health-check-templates',
    AdminHealthTemplateController.createHealthCheckTemplate
);

router.get(
    '/health-check-templates/:templateId',
    AdminHealthTemplateController.getHealthCheckTemplateById
);

router.put(
    '/health-check-templates/:templateId',
    AdminHealthTemplateController.updateHealthCheckTemplate
);

router.delete(
    '/health-check-templates/:templateId',
    AdminHealthTemplateController.deleteHealthCheckTemplate
);

// ROUTE CHO GỢI Ý TÊN VACCINE
router.get(
    '/vaccines/suggestions',
    AdminVaccineSuggestionController.getVaccineSuggestions
);



//ROUTES CHO QUẢN LÝ ĐỐI TÁC Y TẾ
router.post('/partners', AdminPartnerController.createPartner);
router.get('/partners', AdminPartnerController.getPartners);
router.get('/partners/:partnerId', AdminPartnerController.getPartnerById);
router.patch('/partners/:partnerId', AdminPartnerController.updatePartner);
router.patch('/partners/:partnerId/status', AdminPartnerController.updatePartnerStatus);
router.post('/partners/:partnerId/staff', AdminPartnerController.addStaff);
router.delete('/partners/:partnerId/staff/:staffId', AdminPartnerController.removeStaff);
router.put('/partners/:partnerId/manager', AdminPartnerController.replaceManager);


// ROUTE XEM KHO DÀNH CHO ADMIN
router.get(
    '/inventory',
    AdminInventoryViewerController.getInventoryForAdmin
);

export default router;