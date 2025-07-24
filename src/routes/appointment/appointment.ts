import { Router } from 'express';
import { AppointmentController } from '@/controllers/appointment/appointment.controller';
import {
  createAppointmentValidator,
  updateAppointmentStatusValidator,
  respondToAppointmentValidator,
  getAppointmentsValidator,
  updateAppointmentNotesValidator,
} from '@/validators/appointment/appointmentValidator';
import { roleBaseAccess } from '@/middlewares/security/authorization';
import { RoleEnum } from '@/enums/RoleEnum';

const router = Router();

// Routes for nurses
router.get(
  '/students/abnormal-results/:campaignId',
  roleBaseAccess([RoleEnum.Nurse]),
  AppointmentController.getStudentsWithAbnormalResults,
);

router.post(
  '/',
  roleBaseAccess([RoleEnum.Nurse]),
  createAppointmentValidator,
  AppointmentController.createAppointment,
);

router.patch(
  '/:appointmentId/status',
  roleBaseAccess([RoleEnum.Nurse]),
  updateAppointmentStatusValidator,
  AppointmentController.updateAppointmentStatus,
);

router.patch(
  '/:appointmentId/notes',
  roleBaseAccess([RoleEnum.Nurse]),
  updateAppointmentNotesValidator,
  AppointmentController.addAfterMeetingNotes,
);

// Routes for parents
router.patch(
  '/:appointmentId/respond',
  roleBaseAccess([RoleEnum.Parent]),
  respondToAppointmentValidator,
  AppointmentController.respondToAppointment,
);

// Routes for both nurses and parents
router.get(
  '/',
  roleBaseAccess([RoleEnum.Nurse, RoleEnum.Parent]),
  getAppointmentsValidator,
  AppointmentController.getAppointments,
);

// Get Appointment Detail (for nurses and parents)
router.get(
  '/:appointmentId',
  roleBaseAccess([RoleEnum.Nurse, RoleEnum.Parent]),
  AppointmentController.getAppointmentById,
);

export default router;
