import { CampaignStatus } from '@/enums/CampaignEnum';
import { ConsentStatus } from '@/enums/ConsentsEnum';
import {
  IHealthCheckCampaign,
  IHealthCheckCampaignQuery,
  CampaignSortField,
} from '@/interfaces/healthcheck.campaign.interface';
import { HealthCheckCampaign } from '@/models/healthcheck.campaign.model';
import { HealthCheckConsent } from '@/models/healthcheck.consents.model';
import { getSchoolYear } from '@/utils/date-handle';
import { sendHealthCheckAnnounceNotification } from '@/utils/notification.helper';
import { handleSuccessResponse } from '@/utils/responseHandler';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Types } from 'mongoose';

const createHealthCheckCampaign = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const body: IHealthCheckCampaign = req.body;
  try {
    const schoolYear = getSchoolYear();
    const createdAt = new Date();
    body.schoolYear = schoolYear;
    body.createdAt = createdAt;
    body.status = CampaignStatus.DRAFT;

    const healthCheckCampaign = new HealthCheckCampaign(body);
    await healthCheckCampaign.save();

    handleSuccessResponse(
      res,
      200,
      'Health Check Campaign created successfully',
      healthCheckCampaign,
    );
  } catch (error) {
    console.error('Error in createHealthCheckCampaign:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getHealthCheckCampaignDetail = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const healthCheckCampaign = await HealthCheckCampaign.findById(id)
      .populate('templateId')
      .populate('participatingStaffs')
      .populate('assignments.classId')
      .populate('assignments.nurseId')
      .populate('createdBy');

    if (!healthCheckCampaign) {
      res
        .status(404)
        .json({ success: false, message: 'Health Check Campaign not found' });
      return;
    }
    handleSuccessResponse(
      res,
      200,
      'Health Check Campaign retrieved successfully',
      healthCheckCampaign,
    );
  } catch (error) {
    console.error('Error in getHealthCheckCampaignDetail:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllHealthCheckCampaigns = async (req: Request, res: Response) => {
  try {
    const {
      search,
      status,
      schoolYear,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
      startDateFrom,
      startDateTo,
      endDateFrom,
      endDateTo,
      createdBy,
      participatingStaff,
    } = req.query as any;

    // Build filter object
    const filter: any = {};

    // Search functionality - search in name field
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { schoolYear: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (status) {
      if (Array.isArray(status)) {
        filter.status = { $in: status };
      } else {
        filter.status = status;
      }
    }

    // School year filter
    if (schoolYear) {
      if (Array.isArray(schoolYear)) {
        filter.schoolYear = { $in: schoolYear };
      } else {
        filter.schoolYear = schoolYear;
      }
    }

    // Date range filters
    if (startDateFrom || startDateTo) {
      filter.startDate = {};
      if (startDateFrom) filter.startDate.$gte = new Date(startDateFrom);
      if (startDateTo) filter.startDate.$lte = new Date(startDateTo);
    }

    if (endDateFrom || endDateTo) {
      filter.endDate = {};
      if (endDateFrom) filter.endDate.$gte = new Date(endDateFrom);
      if (endDateTo) filter.endDate.$lte = new Date(endDateTo);
    }

    // Created by filter
    if (createdBy) {
      if (Array.isArray(createdBy)) {
        filter.createdBy = {
          $in: createdBy.map((id: string) => new Types.ObjectId(id)),
        };
      } else {
        filter.createdBy = new Types.ObjectId(createdBy);
      }
    }

    // Participating staff filter
    if (participatingStaff) {
      filter.participatingStaffs = { $in: [participatingStaff] };
    }

    // Build sort object
    const sortObj: any = {};
    const validSortFields: CampaignSortField[] = [
      'name',
      'startDate',
      'endDate',
      'createdAt',
      'status',
      'schoolYear',
      'completedDate',
      'actualStartDate',
    ];

    if (validSortFields.includes(sortBy as CampaignSortField)) {
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortObj.createdAt = -1; // default sort
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // max 100 items per page
    const skip = (pageNum - 1) * limitNum;

    // Execute query with aggregation for better performance
    const [campaigns, totalCount] = await Promise.all([
      HealthCheckCampaign.find(filter)
        .populate('templateId')
        .populate('participatingStaffs')
        .populate('assignments.classId')
        .populate('assignments.nurseId')
        .populate('createdBy')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      HealthCheckCampaign.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    const response = {
      campaigns,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      filters: {
        search,
        status,
        schoolYear,
        sortBy,
        sortOrder,
      },
    };

    handleSuccessResponse(
      res,
      200,
      'Health Check Campaigns retrieved successfully',
      response,
    );
  } catch (error) {
    console.error('Error in getAllHealthCheckCampaigns:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateHealthCheckCampaign = async (req: Request, res: Response) => {
  const { id } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const body: IHealthCheckCampaign = req.body;
  try {
    const createdAt = new Date();
    body.createdAt = createdAt;

    if (
      body.status === CampaignStatus.DRAFT ||
      body.status === CampaignStatus.ANNOUNCED
    ) {
      const data = await HealthCheckCampaign.findByIdAndUpdate(id, body, {
        new: true,
      });
      if (!data) {
        res.status(404).json({ message: 'Health Check Campaign not found' });
        return;
      }
      handleSuccessResponse(
        res,
        200,
        'Health Check Campaign updated successfully',
        data,
      );
    } else {
      res.status(400).json({
        message:
          'Campaign can only be updated when it is in DRAFT or ANNOUNCED status',
      });
      return;
    }
  } catch (error) {
    console.error('Error in updateHealthCheckCampaign:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateCampaignStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const campaign = await HealthCheckCampaign.findById(id);
    if (!campaign) {
      res.status(404).json({
        success: false,
        message: 'Health Check Campaign not found',
      });
      return;
    }

    // Validate status transition
    const isValidTransition = validateStatusTransition(
      campaign.status!,
      status,
    );
    if (!isValidTransition) {
      res.status(400).json({
        success: false,
        message: `Invalid status transition from ${campaign.status} to ${status}`,
      });
      return;
    }

    const healthCheckConsents = await HealthCheckConsent.find({
      campaignId: id,
    });

    const updateData: any = { status };

    // Set dates based on status
    switch (status) {
      case CampaignStatus.IN_PROGRESS:
        if (healthCheckConsents.length === 0) {
          res.status(400).json({
            success: false,
            message: 'Cannot start campaign without any consents',
          });
          return;
        }

        healthCheckConsents.forEach((consent) => {
          if (consent.status === ConsentStatus.APPROVED) {
            consent.status = ConsentStatus.PENDING;
            consent.save();
          }
        });

        updateData.actualStartDate = new Date();
        break;
      case CampaignStatus.COMPLETED:
        if (!campaign.actualStartDate) {
          res.status(400).json({
            success: false,
            message: 'Campaign must be in progress before completing',
          });
          return;
        }

        updateData.completedDate = new Date();
        break;
      case CampaignStatus.CANCELED:
        updateData.completedDate = null;
        break;
    }

    const updatedCampaign = await HealthCheckCampaign.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    if (
      updatedCampaign &&
      updatedCampaign.status === CampaignStatus.ANNOUNCED
    ) {
      sendHealthCheckAnnounceNotification(updatedCampaign);
    }

    handleSuccessResponse(
      res,
      200,
      `Campaign status updated to ${status} successfully`,
      updatedCampaign,
    );
  } catch (error) {
    console.error('Error in updateCampaignStatus:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const validateStatusTransition = (
  currentStatus: CampaignStatus,
  newStatus: CampaignStatus,
): boolean => {
  const validTransitions: Record<CampaignStatus, CampaignStatus[]> = {
    [CampaignStatus.DRAFT]: [CampaignStatus.ANNOUNCED, CampaignStatus.CANCELED],
    [CampaignStatus.ANNOUNCED]: [
      CampaignStatus.IN_PROGRESS,
      CampaignStatus.CANCELED,
    ],
    [CampaignStatus.IN_PROGRESS]: [
      CampaignStatus.COMPLETED,
      CampaignStatus.CANCELED,
    ],
    [CampaignStatus.COMPLETED]: [], // No transitions from completed
    [CampaignStatus.CANCELED]: [], // No transitions from canceled
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

const assignStaffToHealthCheckCampaign = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { assignments } = req.body;

  try {
    const healthCheckCampaign = await HealthCheckCampaign.findById(id);
    if (!healthCheckCampaign) {
      res.status(404).json({
        success: false,
        message: 'Health Check Campaign not found',
      });
      return;
    }
    if (healthCheckCampaign.status !== CampaignStatus.DRAFT) {
      res.status(400).json({
        success: false,
        message: 'Campaign can only be updated when it is in DRAFT status',
      });
      return;
    }

    const nurseIds = [
      ...new Set(
        assignments.map((assignment: any) => assignment.nurseId.toString()),
      ),
    ];

    const updatedCampaign = await HealthCheckCampaign.findByIdAndUpdate(
      id,
      {
        assignments: assignments,
        participatingStaffs: nurseIds,
      },
      { new: true },
    );
    handleSuccessResponse(
      res,
      200,
      'Staff assigned to Health Check Campaign successfully',
      updatedCampaign,
    );
  } catch (error) {
    console.error('Error in assignStaffToHealthCheckCampaign:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const searchHealthCheckCampaigns = async (req: Request, res: Response) => {
  try {
    const {
      q: searchTerm,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 20,
    } = req.query as any;

    if (!searchTerm || searchTerm.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Search term is required',
      });
      return;
    }

    const searchRegex = new RegExp(searchTerm.trim(), 'i');

    const campaigns = await HealthCheckCampaign.find({
      $or: [
        { name: searchRegex },
        { schoolYear: searchRegex },
        { status: searchRegex },
      ],
    })
      .populate('templateId', 'name')
      .populate('assignments.classId', 'name')
      .populate('createdBy', 'name')
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .limit(parseInt(limit))
      .lean();

    handleSuccessResponse(
      res,
      200,
      `Found ${campaigns.length} campaigns matching "${searchTerm}"`,
      campaigns,
    );
  } catch (error) {
    console.error('Error in searchHealthCheckCampaigns:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getCampaignsByStatus = async (req: Request, res: Response) => {
  const { status } = req.params;
  const {
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  } = req.query as any;

  try {
    // Validate status
    if (!Object.values(CampaignStatus).includes(status as CampaignStatus)) {
      res.status(400).json({
        success: false,
        message: 'Invalid campaign status',
      });
      return;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [campaigns, totalCount] = await Promise.all([
      HealthCheckCampaign.find({ status })
        .populate('templateId', 'name')
        .populate('assignments.classId', 'name')
        .populate('assignments.nurseId', 'name email')
        .populate('createdBy', 'name')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limitNum),
      HealthCheckCampaign.countDocuments({ status }),
    ]);

    const response = {
      campaigns,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        limit: limitNum,
      },
    };

    handleSuccessResponse(
      res,
      200,
      `Campaigns with status ${status} retrieved successfully`,
      response,
    );
  } catch (error) {
    console.error('Error in getCampaignsByStatus:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getCampaignStats = async (req: Request, res: Response) => {
  try {
    const stats = await HealthCheckCampaign.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          campaigns: {
            $push: { _id: '$_id', name: '$name', createdAt: '$createdAt' },
          },
        },
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          recentCampaigns: { $slice: ['$campaigns', 3] },
          _id: 0,
        },
      },
    ]);

    const totalCampaigns = await HealthCheckCampaign.countDocuments();
    const currentSchoolYear = getSchoolYear();
    const currentYearCampaigns = await HealthCheckCampaign.countDocuments({
      schoolYear: currentSchoolYear,
    });

    const response = {
      totalCampaigns,
      currentSchoolYear,
      currentYearCampaigns,
      statusBreakdown: stats,
      availableStatuses: Object.values(CampaignStatus),
    };

    handleSuccessResponse(
      res,
      200,
      'Campaign statistics retrieved successfully',
      response,
    );
  } catch (error) {
    console.error('Error in getCampaignStats:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export {
  createHealthCheckCampaign,
  getHealthCheckCampaignDetail,
  getAllHealthCheckCampaigns,
  searchHealthCheckCampaigns,
  updateHealthCheckCampaign,
  updateCampaignStatus,
  getCampaignsByStatus,
  getCampaignStats,
  assignStaffToHealthCheckCampaign,
};
