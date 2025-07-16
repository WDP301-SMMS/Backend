import { body, query, param } from 'express-validator';
import { CampaignStatus } from '@/enums/CampaignEnum';

export const validateCreateCampaign = [
  body('name')
    .notEmpty()
    .withMessage('Campaign name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Campaign name must be between 3 and 100 characters'),
  
  body('templateId')
    .notEmpty()
    .withMessage('Template ID is required')
    .isMongoId()
    .withMessage('Invalid template ID'),
  
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
];

export const validateUpdateCampaign = [
  param('id')
    .isMongoId()
    .withMessage('Invalid campaign ID'),
  
  body('name')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Campaign name must be between 3 and 100 characters'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
];

export const validateStatusUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid campaign ID'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(CampaignStatus))
    .withMessage('Invalid campaign status'),
];

export const validateAssignStaff = [
  param('id')
    .isMongoId()
    .withMessage('Invalid campaign ID'),
  
  body('assignments')
    .isArray({ min: 1 })
    .withMessage('At least one assignment is required'),
  
  body('assignments.*.classId')
    .isMongoId()
    .withMessage('Invalid class ID'),
  
  body('assignments.*.nurseId')
    .isMongoId()
    .withMessage('Invalid nurse ID'),
];

export const validateCampaignQuery = [
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  
  query('status')
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) {
        return value.every(status => Object.values(CampaignStatus).includes(status));
      }
      return Object.values(CampaignStatus).includes(value);
    })
    .withMessage('Invalid campaign status'),
  
  query('schoolYear')
    .optional()
    .matches(/^\d{4}-\d{4}$/)
    .withMessage('School year must be in format YYYY-YYYY'),
  
  query('sortBy')
    .optional()
    .isIn(['name', 'startDate', 'endDate', 'createdAt', 'status', 'schoolYear', 'completedDate', 'actualStartDate'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('startDateFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date from format'),
  
  query('startDateTo')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date to format'),
  
  query('endDateFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date from format'),
  
  query('endDateTo')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date to format'),
  
  query('createdBy')
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) {
        return value.every(id => /^[0-9a-fA-F]{24}$/.test(id));
      }
      return /^[0-9a-fA-F]{24}$/.test(value);
    })
    .withMessage('Invalid created by user ID'),
  
  query('participatingStaff')
    .optional()
    .isMongoId()
    .withMessage('Invalid participating staff ID'),
];

export const validateSearch = [
  query('q')
    .notEmpty()
    .withMessage('Search term is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  
  query('sortBy')
    .optional()
    .isIn(['name', 'startDate', 'endDate', 'createdAt', 'status', 'schoolYear'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];

export const validateGetByStatus = [
  param('status')
    .isIn(Object.values(CampaignStatus))
    .withMessage('Invalid campaign status'),
  
  query('sortBy')
    .optional()
    .isIn(['name', 'startDate', 'endDate', 'createdAt', 'schoolYear'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];
