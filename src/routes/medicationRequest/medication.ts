import express from 'express';
import { RequestController } from '@/controllers/medicationRequest/medication.request.controller';
import { ScheduleController } from '@/controllers/medicationRequest/medication.schedule.controller';
import { handleUploadFile } from '@/middlewares/upload/uploadToFirebase';

import {
  validateMedicationRequest,
  validateUpdateRequest,
  validateUpdateRequestItems,
} from '@/validators/medicationRequest/medication.request.validator';

import {
  validateCreateSchedule,
  validateUpdateScheduleStatus,
} from '@/validators/medicationRequest/medication.schedule.validator';

const router = express.Router();

//REQUEST
//Y tá tạo request
router.post(
  '/requests',
  ...handleUploadFile('prescriptionFile'),
  (req, _res, next) => {
    try {
      if (typeof req.body.items === 'string') {
        req.body.items = JSON.parse(req.body.items);
      }
    } catch {}
    next();
  },
  validateMedicationRequest,
  RequestController.createMedicationRequest,
);

//Lấy tất cả request
router.get('/allRequests', RequestController.getAllRequest);

//Lấy request theo id
router.get('/requests/:id', RequestController.getMedicationRequestById);

//Lấy request theo phụ huynh
router.get(
  '/requests/parent',
  RequestController.getMedicationRequestByParentId,
);

//Update Request (không đụng item)
router.patch(
  '/requests/:id',
  ...handleUploadFile('prescriptionFile'),
  (req, _res, next) => {
    try {
      if (req.body.startDate) req.body.startDate = new Date(req.body.startDate);
      if (req.body.endDate) req.body.endDate = new Date(req.body.endDate);
      if (req.file?.path) req.body.prescriptionFile = req.file.path;
    } catch {}
    next();
  },
  validateUpdateRequest,
  RequestController.updateMedicationRequest,
);

// Update request items riêng
router.patch(
  '/requests/:id/items',
  validateUpdateRequestItems,
  RequestController.updateRequestItems,
);

//SCHEDULE
//Tạo schedule theo request
router.post(
  '/schedules',
  validateCreateSchedule,
  ScheduleController.createSchedules,
);

//Cập nhật status cho schedule
router.patch(
  '/schedules/update/:scheduleId',
  validateUpdateScheduleStatus,
  ScheduleController.updateScheduleStatus,
);

// Lấy schedules theo medicationRequestId
router.get(
  '/schedules/request/:medicationRequestId',
  ScheduleController.getSchedulesByRequestId,
);

// Lấy schedules theo studentId
router.get(
  '/schedules/student/:studentId',
  ScheduleController.getSchedulesByStudentId,
);

export default router;
