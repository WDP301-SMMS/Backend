import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

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

const objectIdValidator = Joi.string().hex().length(24).required().messages({
  'string.empty': `"{#label}" is required.`,
  'string.hex': `"{#label}" must be a valid 24-character hexadecimal string.`,
  'string.length': `"{#label}" must be 24 characters long.`,
  'any.required': `"{#label}" is a required field.`,
});


const createProfileSchema = Joi.object({
  invitedCode: objectIdValidator.label('Invitation Code'),
  
  allergies: Joi.string().required().max(1000).messages({
    'string.empty': 'Allergies information is required. Please enter "None" if there are no allergies.',
  }),
  chronicConditions: Joi.string().required().max(1000).messages({
    'string.empty': 'Chronic Conditions information is required. Please enter "None" if there are no chronic conditions.',
  }),
  visionStatus: Joi.string().required().max(500),
  hearingStatus: Joi.string().required().max(500),
  
  vaccines: Joi.array().items(
    Joi.object({
      vaccineName: Joi.string().required(),
      doseNumber: Joi.number().integer().min(1).required(),
    })
  ).optional().default([]), 
});



const updateProfileSchema = Joi.object({

  allergies: Joi.string().max(1000).optional(),
  chronicConditions: Joi.string().max(1000).optional(),
  visionStatus: Joi.string().max(500).optional(),
  hearingStatus: Joi.string().max(500).optional(),
  
  vaccines: Joi.array().items(
    Joi.object({
      vaccineName: Joi.string().required(),
      doseNumber: Joi.number().integer().min(1).required(),
    })
  ).optional(),

}).min(1).messages({ 
    'object.min': 'At least one field must be provided for update.'
});



export const createProfileValidator = validate(createProfileSchema);
export const updateProfileValidator = validate(updateProfileSchema);