import express from 'express';
import { 
  getStudentHealthCheckRecord, 
  getStudentLatestHealthCheckRecord,
  createHealthCheckResultBaseOnTemplate,
  updateHealthCheckResult
} from '@/controllers/health-check/health-check-record.controller';

const router = express.Router();

// Async handler wrapper
const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Get student health check records by student ID
router.get('/:id', asyncHandler(getStudentHealthCheckRecord));

// Get latest health check record for a student
router.get('/:id/latest', asyncHandler(getStudentLatestHealthCheckRecord));

// Create health check result based on template
router.post('/create-result', asyncHandler(createHealthCheckResultBaseOnTemplate));

// Update health check result
router.put('/result/:resultId', asyncHandler(updateHealthCheckResult));

export default router;
