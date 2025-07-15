import { Router } from 'express';
import {
  createHealthCheckCampaign,
  getHealthCheckCampaignDetail,
  getAllHealthCheckCampaigns,
  searchHealthCheckCampaigns,
  updateHealthCheckCampaign,
  updateCampaignStatus,
  getCampaignsByStatus,
  getCampaignStats,
  assignStaffToHealthCheckCampaign,
} from '@/controllers/health-check/health-check-campaign.controller';
import {
  validateCreateCampaign,
  validateUpdateCampaign,
  validateStatusUpdate,
  validateAssignStaff,
  validateCampaignQuery,
  validateSearch,
  validateGetByStatus,
} from '@/validators/health-check/health.check.campaign.validator';

import { RoleEnum } from '@/enums/RoleEnum';

const router = Router();

/**
 * @route GET /api/health-check/campaigns
 * @desc Get all health check campaigns with advanced filtering, sorting, and pagination
 * @access ADMIN, NURSE, MANAGER
 */
router.get('/', validateCampaignQuery, getAllHealthCheckCampaigns);

/**
 * @route GET /api/health-check/campaigns/search
 * @desc Search health check campaigns
 * @access ADMIN, NURSE, MANAGER
 */
router.get('/search', validateSearch, searchHealthCheckCampaigns);

/**
 * @route GET /api/health-check/campaigns/stats
 * @desc Get campaign statistics and dashboard data
 * @access ADMIN, MANAGER
 */
router.get('/stats', getCampaignStats);

/**
 * @route GET /api/health-check/campaigns/status/:status
 * @desc Get campaigns by specific status
 * @access ADMIN, NURSE, MANAGER
 */
router.get('/status/:status', validateGetByStatus, getCampaignsByStatus);

/**
 * @route POST /api/health-check/campaigns
 * @desc Create a new health check campaign
 * @access ADMIN, MANAGER
 */
router.post('/', validateCreateCampaign, createHealthCheckCampaign);

/**
 * @route GET /api/health-check/campaigns/:id
 * @desc Get a specific health check campaign by ID
 * @access ADMIN, NURSE, MANAGER
 */
router.get('/:id', getHealthCheckCampaignDetail);

/**
 * @route PUT /api/health-check/campaigns/:id
 * @desc Update a health check campaign (only DRAFT or ANNOUNCED status)
 * @access ADMIN, MANAGER
 */
router.put('/:id', validateUpdateCampaign, updateHealthCheckCampaign);

/**
 * @route PATCH /api/health-check/campaigns/:id/status
 * @desc Update campaign status with validation rules
 * @access ADMIN, MANAGER
 */
router.patch('/:id/status', validateStatusUpdate, updateCampaignStatus);

/**
 * @route PUT /api/health-check/campaigns/:id/assignments
 * @desc Assign staff to health check campaign
 * @access ADMIN, MANAGER
 */
router.put(
  '/:id/assignments',
  validateAssignStaff,
  assignStaffToHealthCheckCampaign,
);

export default router;
