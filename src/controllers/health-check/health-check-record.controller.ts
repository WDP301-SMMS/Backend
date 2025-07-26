import { ConsentStatus } from '@/enums/ConsentsEnum';
import { HealthCheckCampaign } from '@/models/healthcheck.campaign.model';
import { HealthCheckConsent } from '@/models/healthcheck.consents.model';
import { HealthCheckRecordModel } from '@/models/healthcheck.record.model';
import { HealthCheckResult } from '@/models/healthcheck.result.model';
import { handleSuccessResponse } from '@/utils/responseHandler';
import { Request, Response } from 'express';

const createHealthCheckResultBaseOnTemplate = async (
  req: Request,
  res: Response,
) => {
  const body = req.body;

  // Input validation
  if (
    !body.campaignId ||
    !body.nurseId ||
    !body.studentId ||
    !body.resultsData
  ) {
    res.status(400).json({
      message:
        'Missing required fields: campaignId, nurseId, studentId, and resultsData are required',
    });
    return;
  }

  try {

    const healthCheckConsent = await HealthCheckConsent.findOne({
      studentId: body.studentId,
      campaignId: body.campaignId,
    });
    if (!healthCheckConsent) {
      res
        .status(404)
        .json({ message: 'Student is not enrolled in this campaign' });
      return;
    }

    if (healthCheckConsent.status !== ConsentStatus.PENDING) {
      res.status(400).json({
        message:
          'Health check consent must be pending before creating a result',
      });
      return;
    }


    const healthCheckResult = await HealthCheckResult.create({
      campaignId: body.campaignId,
      nurseId: body.nurseId,
      studentId: body.studentId,
      checkupDate: body.checkupDate || new Date(),
      isAbnormal: body.isAbnormal || false,
      recommendations: body.recommendations || '',
      overallConclusion: body.overallConclusion || '',
      resultsData: body.resultsData,
    });

    // Create or update health check record
    const existingRecord = await HealthCheckRecordModel.findOne({
      studentId: body.studentId,
    });

    if (existingRecord) {
      existingRecord.latestResultId = healthCheckResult._id;
      await existingRecord.save();
    } else {
      await HealthCheckRecordModel.create({
        resultId: healthCheckResult._id,
        studentId: body.studentId,
        latestResultId: healthCheckResult._id,
      });
    }

    healthCheckConsent.status = ConsentStatus.COMPLETED;
    healthCheckConsent.save();

    handleSuccessResponse(
      res,
      201,
      'Health check result created successfully',
      healthCheckResult,
    );
  } catch (error) {
    console.error('Error creating health check result:', error);

    // Handle specific MongoDB validation errors
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        res.status(400).json({
          message: 'Validation error',
          details: error.message,
        });
      } else if (error.name === 'CastError') {
        res.status(400).json({
          message: 'Invalid ID format',
        });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
    return;
  }
};

const getStudentHealthCheckRecord = async (req: Request, res: Response) => {
  const { id } = req.params;

  // Input validation
  if (!id) {
    res.status(400).json({ message: 'Student ID is required' });
    return;
  }

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

    if (error instanceof Error && error.name === 'CastError') {
      res.status(400).json({ message: 'Invalid student ID format' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
    return;
  }
};

const getStudentLatestHealthCheckRecord = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;

  // Input validation
  if (!id) {
    res.status(400).json({ message: 'Student ID is required' });
    return;
  }

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

    if (error instanceof Error && error.name === 'CastError') {
      res.status(400).json({ message: 'Invalid student ID format' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
    return;
  }
};

const updateHealthCheckResult = async (req: Request, res: Response) => {
  const { resultId } = req.params;
  const body = req.body;

  // Input validation
  if (!resultId) {
    res.status(400).json({ message: 'Result ID is required' });
    return;
  }

  try {
    const healthCheckResult = await HealthCheckResult.findById(resultId);
    if (!healthCheckResult) {
      res.status(404).json({ message: 'Health check result not found' });
      return;
    }

    // Update the result data
    const updatedData = {
      resultsData: body.resultsData || healthCheckResult.resultsData,
      isAbnormal: body.isAbnormal ?? healthCheckResult.isAbnormal,
      recommendations:
        body.recommendations || healthCheckResult.recommendations,
      overallConclusion:
        body.overallConclusion || healthCheckResult.overallConclusion,
      checkupDate: body.checkupDate || healthCheckResult.checkupDate,
    };

    const updatedResult = await HealthCheckResult.findByIdAndUpdate(
      resultId,
      updatedData,
      { new: true, runValidators: true },
    );

    // Update the latest result in the record
    await HealthCheckRecordModel.findOneAndUpdate(
      { studentId: healthCheckResult.studentId },
      { latestResultId: resultId },
    );

    handleSuccessResponse(
      res,
      200,
      'Health check result updated successfully',
      updatedResult,
    );
  } catch (error) {
    console.error('Error updating health check result:', error);

    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        res.status(400).json({
          message: 'Validation error',
          details: error.message,
        });
      } else if (error.name === 'CastError') {
        res.status(400).json({
          message: 'Invalid ID format',
        });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
    return;
  }
};

export {
  createHealthCheckResultBaseOnTemplate,
  getStudentHealthCheckRecord,
  getStudentLatestHealthCheckRecord,
  updateHealthCheckResult,
};
