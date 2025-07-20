import express from 'express';
import { 
  getStudentHealthCheckRecord, 
  getStudentLatestHealthCheckRecord,
  createHealthCheckResultBaseOnTemplate,
  updateHealthCheckResult
} from '@/controllers/health-check/health-check-record.controller';
import { roleBaseAccess } from '@/middlewares/security/authorization';
import { RoleEnum } from '@/enums/RoleEnum';

const router = express.Router();

// Async handler wrapper
const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Get student health check records by student ID
router.get('/:id', roleBaseAccess([RoleEnum.Manager, RoleEnum.Nurse, RoleEnum.Parent]),asyncHandler(getStudentHealthCheckRecord));

// Get latest health check record for a student
router.get('/:id/latest', roleBaseAccess([RoleEnum.Manager, RoleEnum.Nurse, RoleEnum.Parent]),asyncHandler(getStudentLatestHealthCheckRecord));

// Create health check result based on template
router.post('/create-result', roleBaseAccess([RoleEnum.Manager, RoleEnum.Nurse]),asyncHandler(createHealthCheckResultBaseOnTemplate));

// Update health check result
router.put('/result/:resultId', roleBaseAccess([RoleEnum.Manager, RoleEnum.Nurse]),asyncHandler(updateHealthCheckResult));

export default router;
