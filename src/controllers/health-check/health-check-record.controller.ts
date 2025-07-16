import { HealthCheckRecordModel } from '@/models/healthcheck.record.model';
import { handleSuccessResponse } from '@/utils/responseHandler';
import { Request, Response } from 'express';

const getStudentHealthCheckRecord = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const records = await HealthCheckRecordModel.find({
      studentId: id,
    })
      .populate('resultId')
      .populate('studentId');
    if (!records || records.length === 0) {
      res.status(404).json({ message: 'Record not found' });
      return;
    }
    handleSuccessResponse(
      res,
      200,
      'Health check records fetched successfully',
      records,
    );
  } catch (error) {
    console.error('Error fetching health check record:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

const getStudentLatestHealthCheckRecord = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;

  try {
    const record = await HealthCheckRecordModel.findOne({
      studentId: id,
    })
      .populate('resultId')
      .populate('latestResultId');
    const latestRecord = record?.latestResultId;

    if (!latestRecord) {
      res.status(404).json({ message: 'Record not found' });
      return;
    }
    handleSuccessResponse(
      res,
      200,
      'Latest health check record fetched successfully',
      latestRecord,
    );
  } catch (error) {
    console.error('Error fetching latest health check record:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

export {
  getStudentHealthCheckRecord,
  getStudentLatestHealthCheckRecord,
};
