import express from 'express';
import { RequestController } from '@/controllers/medicationRequest/medication.request.controller';
import { ScheduleController } from '@/controllers/medicationRequest/medication.schedule.controller';
import { handleUploadFile } from '@/middlewares/upload/uploadToFirebase';

import { validateMedicationRequest } from '@/validators/medicationRequest/medication.request.validator';

import {
  validateScheduleArray,
  validateUpdateStatus,
} from '@/validators/medicationRequest/medication.schedule.validator';

const router = express.Router();

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

router.get('/allRequests', RequestController.getMedicationRequestById);

//Lấy request theo id
router.get('/requests/:id', RequestController.getMedicationRequestById);

//Lấy request theo phụ huynh
router.get(
  '/requests/parent/:id',
  RequestController.getMedicationRequestByParentId,
);

//Tạo schedule theo request
router.post(
  '/schedules',
  validateScheduleArray,
  ScheduleController.createSchedules,
);

//Cập nhật status cho schedule
router.patch(
  '/schedules/update/:scheduleId',
  validateUpdateStatus,
  ScheduleController.updateScheduleStatus,
);

export default router;
