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



const claimStudentSchema = Joi.object({
  invitedCode: Joi.string().required().label('Invitation Code').messages({
    'string.empty': 'Invitation code cannot be empty.',
  }),
});


const createProfileSchema = Joi.object({
  studentId: objectIdValidator.label('Student ID'),
  
  allergies: Joi.array().items(
    Joi.object({
      vaccineName: Joi.string().required(),
      doseNumber: Joi.number().integer().min(1).required(),
    })
  ).optional().default([]),
  chronicConditions: Joi.array().items(
    Joi.object({
      vaccineName: Joi.string().required(),
      doseNumber: Joi.number().integer().min(1).required(),
    })
  ).optional().default([]),
  visionStatus: Joi.array().items(
    Joi.object({
      vaccineName: Joi.string().required(),
      doseNumber: Joi.number().integer().min(1).required(),
    })
  ).optional().default([]),
  hearingStatus: Joi.array().items(
    Joi.object({
      vaccineName: Joi.string().required(),
      doseNumber: Joi.number().integer().min(1).required(),
    })
  ).optional().default([]),
  
  vaccines: Joi.array().items(
    Joi.object({
      vaccineName: Joi.string().required(),
      doseNumber: Joi.number().integer().min(1).required(),
    })
  ).optional().default([]),
});


const updateProfileSchema = Joi.object({
  allergies: Joi.array().items(
    Joi.object({
      vaccineName: Joi.string().required(),
      doseNumber: Joi.number().integer().min(1).required(),
    })
  ).optional().default([]),
  chronicConditions: Joi.array().items(
    Joi.object({
      vaccineName: Joi.string().required(),
      doseNumber: Joi.number().integer().min(1).required(),
    })
  ).optional().default([]),
  visionStatus: Joi.array().items(
    Joi.object({
      vaccineName: Joi.string().required(),
      doseNumber: Joi.number().integer().min(1).required(),
    })
  ).optional().default([]),
  hearingStatus: Joi.array().items(
    Joi.object({
      vaccineName: Joi.string().required(),
      doseNumber: Joi.number().integer().min(1).required(),
    })
  ).optional().default([]),
  
  vaccines: Joi.array().items(
    Joi.object({
      vaccineName: Joi.string().required(),
      doseNumber: Joi.number().integer().min(1).required(),
    })
  ).optional().default([]),

}).min(1).messages({ 
    'object.min': 'At least one field must be provided for update.'
});



export const claimStudentValidator = validate(claimStudentSchema);
export const createProfileValidator = validate(createProfileSchema);
export const updateProfileValidator = validate(updateProfileSchema);