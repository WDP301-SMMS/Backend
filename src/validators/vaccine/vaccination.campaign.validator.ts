import { CampaignStatus } from '@/enums/CampaignEnum';
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';



const objectIdValidator = Joi.string().hex().length(24).messages({
  'string.pattern.base': `"{#label}" must be a valid MongoDB ObjectId.`,
});


const createCampaignSchema = Joi.object({
  name: Joi.string().min(5).max(200).required().messages({
    'string.empty': 'Campaign name is required.',
    'string.min': 'Campaign name must be at least 5 characters long.',
  }),
  vaccineName: Joi.string().required(),
  doseNumber: Joi.number().integer().min(1).required(),
  partnerId: objectIdValidator.required().label('Partner ID'),
  targetGradeLevels: Joi.array().items(Joi.number().integer().min(1)).min(1).required().messages({
    'array.min': 'At least one target grade level is required.',
  }),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
    'date.greater': 'End date must be after start date.',
  }),
  description: Joi.string().allow('').max(1000).optional(),
  schoolYear: Joi.string().pattern(/^\d{4}-\d{4}$/).required().messages({
    'string.pattern.base': 'School year must be in format YYYY-YYYY (e.g., 2023-2024).',
  }),
});


const updateCampaignSchema = Joi.object({
  name: Joi.string().min(5).max(200).optional(),
  description: Joi.string().allow('').max(1000).optional(),
  status: Joi.string().valid(...Object.values(CampaignStatus)).optional(),
  cancellationReason: Joi.string().when('status', {
    is: CampaignStatus.CANCELED,
    then: Joi.string().min(10).required().messages({
      'string.empty': 'Cancellation reason is required when cancelling a campaign.',
      'string.min': 'Cancellation reason must be at least 10 characters long.',
    }),
    otherwise: Joi.optional(),
  }),
}).min(1); 


const validate = (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false, 
    stripUnknown: true,
  });
  
  if (error) {
    const errorDetails = error.details.map(d => ({
      message: d.message,
      field: d.path.join('.'),
    }));
    return res.status(400).json({ 
      success: false,
      message: 'Validation Error', 
      errors: errorDetails 
    });
  }

  req.body = value;
  next();
};

// Export các middleware đã được tạo sẵn
export const createCampaignValidator = validate(createCampaignSchema);
export const updateCampaignValidator = validate(updateCampaignSchema);