import { HealthCheckRecordModel } from '@/models/healthcheck.record.model';
import { HealthCheckResult } from '@/models/healthcheck.result.model';
import { HealthCheckTemplate } from '@/models/healthcheck.templates.model';
import { handleSuccessResponse } from '@/utils/responseHandler';
import { Request, Response } from 'express';

const createHealthCheckResultBaseOnTemplate = async (
  req: Request,
  res: Response,
) => {
  const body = req.body;
  try {
    const template = await HealthCheckTemplate.findOne({
      templateId: body.templateId,
    });
    if (!template) {
      res.status(404).json({ message: 'Template not found' });
      return;
    }

    // Initialize resultsData based on template items
    const resultsData = template.checkupItems?.map((item: any) => ({
      itemName: item.itemName,
      value: null, // Will be filled when actual checkup is performed
      unit: item.unit || null,
      isAbnormal: false,
      notes: ''
    })) || [];

    const healthCheckResult = await HealthCheckResult.create({
      campaignId: body.campaignId,
      nurseId: body.nurseId,
      studentId: body.studentId,
      checkupDate: body.checkupDate || new Date(),
      isAbnormal: false,
      recommendations: '',
      overallConclusion: '',
      resultsData: resultsData
    });

    await healthCheckResult.save();

    // Create or update health check record
    const existingRecord = await HealthCheckRecordModel.findOne({
      studentId: body.studentId
    });

    if (existingRecord) {
      // Update existing record
      existingRecord.latestResultId = healthCheckResult._id;
      await existingRecord.save();
    } else {
      // Create new record
      await HealthCheckRecordModel.create({
        resultId: healthCheckResult._id,
        studentId: body.studentId,
        latestResultId: healthCheckResult._id
      });
    }

    handleSuccessResponse(
      res,
      201,
      'Health check result created successfully',
      healthCheckResult,
    );
  } catch (error) {
    console.error('Error creating health check result:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

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

const updateHealthCheckResult = async (req: Request, res: Response) => {
  const { resultId } = req.params;
  const body = req.body;
  
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
      recommendations: body.recommendations || healthCheckResult.recommendations,
      overallConclusion: body.overallConclusion || healthCheckResult.overallConclusion,
      checkupDate: body.checkupDate || healthCheckResult.checkupDate
    };

    const updatedResult = await HealthCheckResult.findByIdAndUpdate(
      resultId,
      updatedData,
      { new: true, runValidators: true }
    );

    // Update the latest result in the record
    await HealthCheckRecordModel.findOneAndUpdate(
      { studentId: healthCheckResult.studentId },
      { latestResultId: resultId }
    );

    handleSuccessResponse(
      res,
      200,
      'Health check result updated successfully',
      updatedResult,
    );
  } catch (error) {
    console.error('Error updating health check result:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

export { 
  createHealthCheckResultBaseOnTemplate,
  getStudentHealthCheckRecord, 
  getStudentLatestHealthCheckRecord,
  updateHealthCheckResult
};
