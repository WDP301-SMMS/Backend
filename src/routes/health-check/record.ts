import express from 'express';
import { getStudentHealthCheckRecord, getStudentLatestHealthCheckRecord } from '@/controllers/health-check/health-check-record.controller';

const router = express.Router();

router.get('/', getStudentHealthCheckRecord);
router.get('/latest', getStudentLatestHealthCheckRecord);

export default router;
