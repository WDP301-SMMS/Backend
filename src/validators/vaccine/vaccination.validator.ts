import { CampaignStatus } from '@/enums/CampaignEnum';
import { ConsentStatus } from '@/enums/ConsentsEnum';
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const objectIdValidator = Joi.string().hex().length(24).messages({
  'string.pattern.base': `"{#label}" must be a valid MongoDB ObjectId.`,
});

const validate =
  (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((d) => ({
        message: d.message,
        field: d.path.join('.'),
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errorDetails,
      });
    }

    req.body = value;
    next();
  };

const createCampaignSchema = Joi.object({
  name: Joi.string().min(5).max(200).required().messages({
    'string.empty': 'Campaign name is required.',
    'string.min': 'Campaign name must be at least 5 characters long.',
  }),
  vaccineName: Joi.string().required(),
  doseNumber: Joi.number().integer().min(1).required(),
  partnerId: objectIdValidator.required().label('Partner ID'),
  targetGradeLevels: Joi.array()
    .items(Joi.number().integer().min(1))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one target grade level is required.',
    }),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
    'date.greater': 'End date must be after start date.',
  }),
  description: Joi.string().allow('').max(1000).optional(),
  schoolYear: Joi.string()
    .pattern(/^\d{4}-\d{4}$/)
    .required()
    .messages({
      'string.pattern.base':
        'School year must be in format YYYY-YYYY (e.g., 2023-2024).',
    }),
  destination: Joi.string().allow('').optional(),
  createdBy: objectIdValidator.required().label('CreatedBy ID'),
  actualStartDate: Joi.date().iso().optional(),
});

const updateCampaignSchema = Joi.object({
  name: Joi.string().min(5).max(200).optional(),
  description: Joi.string().allow('').max(1000).optional(),
  status: Joi.string()
    .valid(...Object.values(CampaignStatus))
    .optional(),
  cancellationReason: Joi.string().when('status', {
    is: CampaignStatus.CANCELED,
    then: Joi.string().min(10).required().messages({
      'string.empty':
        'Cancellation reason is required when cancelling a campaign.',
      'string.min': 'Cancellation reason must be at least 10 characters long.',
    }),
    otherwise: Joi.optional(),
  }),
  destination: Joi.string().allow('').optional(),
  actualStartDate: Joi.date().iso().optional(),
}).min(1);

const respondToConsentSchema = Joi.object({
  status: Joi.string()
    .required()
    .valid(ConsentStatus.APPROVED, ConsentStatus.DECLINED)
    .messages({
      'string.empty': 'Status is required.',
      'any.only': `Status must be either '${ConsentStatus.APPROVED}' or '${ConsentStatus.DECLINED}'.`,
    }),

  reasonForDeclining: Joi.string().when('status', {
    is: ConsentStatus.DECLINED,
    then: Joi.string().min(10).required().messages({
      'string.empty':
        'Reason for declining is required when status is DECLINED.',
      'string.min': 'Reason for declining must be at least 10 characters long.',
    }),
    otherwise: Joi.forbidden().messages({
      'any.unknown':
        'Reason for declining is not allowed when status is APPROVED.',
    }),
  }),
});

const createRecordSchema = Joi.object({
  consentId: objectIdValidator.label('Consent ID'),
  administeredAt: Joi.date().iso().required().messages({
    'date.base': 'Administered At must be a valid ISO date.',
    'any.required': 'Administered At is required.',
  }),
  administeredByStaffId: objectIdValidator.label('Administered By Staff ID'),
});

const addObservationSchema = Joi.object({
  observedAt: Joi.date().iso().required().messages({
    'date.base': 'Observed At must be a valid ISO date.',
    'any.required': 'Observed At is required.',
  }),
  temperatureLevel: Joi.number().required().min(35).max(43).messages({
    'number.base': 'Temperature Level must be a number.',
    'any.required': 'Temperature Level is required.',
    'number.min': 'Temperature seems too low, please re-check.',
    'number.max': 'Temperature seems too high, please re-check.',
  }),
  notes: Joi.string().allow('').max(500).optional(),
  isAbnormal: Joi.boolean().required().messages({
    'boolean.base': 'isAbnormal must be a boolean (true/false).',
    'any.required': 'isAbnormal is required.',
  }),
  actionsTaken: Joi.string().when('isAbnormal', {
    is: true,
    then: Joi.string().min(10).required().messages({
      'string.empty':
        'Actions Taken is required when the observation is abnormal.',
      'string.min': 'Actions Taken must be at least 10 characters long.',
    }),
    otherwise: Joi.optional().allow(''),
  }),
});

// Export các middleware đã được tạo sẵn
export const createCampaignValidator = validate(createCampaignSchema);
export const updateCampaignValidator = validate(updateCampaignSchema);
export const respondToConsentValidator = validate(respondToConsentSchema);
export const createRecordValidator = validate(createRecordSchema);
export const addObservationValidator = validate(addObservationSchema);
