import { ConsentStatus } from '@/enums/ConsentsEnum';
import { StudentStatus } from '@/enums/StudentEnum';
import { HealthCheckCampaign } from '@/models/healthcheck.campaign.model';
import { HealthCheckConsent } from '@/models/healthcheck.consents.model';
import { StudentModel } from '@/models/student.model';
import { handleSuccessResponse } from '@/utils/responseHandler';
import { Request, Response } from 'express';
import { Types } from 'mongoose';

const addAllStudentToConsentByCampaignId = async (
  req: Request,
  res: Response,
) => {
  try {
    const { campaignId } = req.body;

    // Validate campaignId
    if (!campaignId || !Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid campaign ID is required',
      });
    }

    // Find the campaign
    const campaign = await HealthCheckCampaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    // Create class-to-nurse mapping
    const classAssignments: Record<string, string> = {};
    if (campaign.assignments && campaign.assignments.length > 0) {
      campaign.assignments.forEach((assignment) => {
        classAssignments[assignment.classId.toString()] =
          assignment.nurseId.toString();
      });
    }

    const classIds = Object.keys(classAssignments);
    if (classIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No class assignments found for this campaign',
      });
    }

    // Find active students in assigned classes
    const students = await StudentModel.find({
      status: StudentStatus.ACTIVE,
      classId: { $in: classIds },
    });

    if (students.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No active students found for the assigned classes',
        data: { campaignId, studentCount: 0 },
      });
    }

    // Get existing consents for this campaign
    const existingConsents = await HealthCheckConsent.find({
      campaignId: campaign._id,
    }).select('studentId');

    const existingStudentIds = new Set(
      existingConsents.map((consent) => consent.studentId.toString()),
    );

    // Filter out students who already have consents
    const studentsNeedingConsent = students.filter(
      (student) => !existingStudentIds.has(student._id.toString()),
    );

    if (studentsNeedingConsent.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All students already have consents for this campaign',
        data: { campaignId, studentCount: 0 },
      });
    }

    // Create consent records for students who don't have them
    const newConsents = studentsNeedingConsent.map((student) => {
      const nurseId = classAssignments[student.classId.toString()];

      return {
        campaignId: campaign._id,
        studentId: student._id,
        classId: student.classId,
        parentId: student.parentId || new Types.ObjectId(),
        nurseId: nurseId ? new Types.ObjectId(nurseId) : null,
        status: ConsentStatus.PENDING,
        reasonForDeclining: null,
        confirmedAt: null,
      };
    });

    await HealthCheckConsent.insertMany(newConsents);

    handleSuccessResponse(
      res,
      201,
      'Students added to health check consent successfully',
      {
        campaignId,
        studentsAdded: newConsents.length,
        totalStudents: students.length,
      },
    );
  } catch (err) {
    console.error('Error in addAllStudentToConsentByCampaignId:', err);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const getHealthCheckConsentsByCampaignId = async (
  req: Request,
  res: Response,
) => {
  try {
    const { campaignId } = req.params;

    if (!campaignId || !Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid campaign ID is required',
      });
    }

    const consents = await HealthCheckConsent.find({ campaignId })
      .populate('studentId', 'fullName')
      .populate('parentId', 'fullName')
      .populate('classId', 'name')
      .populate('nurseId', 'fullName')
      .sort({ createdAt: -1 });

    handleSuccessResponse(
      res,
      200,
      'Health check consents retrieved successfully',
      consents,
    );
  } catch (error) {
    console.error('Error in getHealthCheckConsentsByCampaignId:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const handleStatusConsent = async (req: Request, res: Response) => {
  const { consentId } = req.params;
  const { status } = req.body;
  try {
    const consent = await HealthCheckConsent.findById(consentId);
    if (!consent) {
      return res.status(404).json({
        success: false,
        message: 'Consent not found',
      });
    }

    if (consent.status !== ConsentStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'Consent is not in a pending state',
      });
    }

    if (validateStatusTransition(consent.status, status) === false) {
      return res.status(400).json({
        success: false,
        message: 'Invalid consent status',
      });
    }
    consent.status = status;
    consent.confirmedAt = new Date();

    if (status === ConsentStatus.DECLINED) {
      consent.reasonForDeclining = req.body.reasonForDeclining || null;
    } else {
      consent.reasonForDeclining = null;
    }

    await consent.save();

    handleSuccessResponse(
      res,
      200,
      'Consent status updated successfully',
      consent,
    );
  } catch (error) {
    console.error('Error in handleStatusConsent:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const getAllConsents = async (req: Request, res: Response) => {
  try {
    const consents = await HealthCheckConsent.find({})
      .populate('studentId', 'fullName')
      .populate('parentId', 'fullName')
      .populate('classId', 'name')
      .populate('nurseId', 'fullName')
      .sort({ createdAt: -1 });

    handleSuccessResponse(
      res,
      200,
      'All health check consents retrieved successfully',
      consents,
    );
  } catch (error) {
    console.error('Error in getAllConsents:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const allowedStatusTransitions = (): Record<ConsentStatus, ConsentStatus[]> => {
  return {
    [ConsentStatus.PENDING]: [ConsentStatus.APPROVED, ConsentStatus.DECLINED],
    [ConsentStatus.APPROVED]: [ConsentStatus.REVOKED, ConsentStatus.COMPLETED],
    [ConsentStatus.COMPLETED]: [],
    [ConsentStatus.DECLINED]: [],
    [ConsentStatus.REVOKED]: [],
    [ConsentStatus.UNDER_OBSERVATION]: [
      ConsentStatus.COMPLETED,
      ConsentStatus.ADVERSE_REACTION,
    ],
    [ConsentStatus.ADVERSE_REACTION]: [ConsentStatus.COMPLETED],
  };
};

const validateStatusTransition = (
  currentStatus: ConsentStatus,
  newStatus: ConsentStatus,
): boolean => {
  const allowedTransitions = allowedStatusTransitions();
  return allowedTransitions[currentStatus]?.includes(newStatus) ?? false;
};

export default {
  getHealthCheckConsentsByCampaignId,
  getAllConsents,
  addAllStudentToConsentByCampaignId,
  handleStatusConsent,
};
