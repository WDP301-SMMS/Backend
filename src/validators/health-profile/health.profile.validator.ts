import { EAllergySeverity } from '@/enums/AllergyEnums';
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


const allergySchema = Joi.object({
  type: Joi.string().optional().allow(''),
  reaction: Joi.string().optional().allow(''),
  severity: Joi.string().valid(...Object.values(EAllergySeverity)).optional().allow(''),
  notes: Joi.string().optional().allow(''),
});

const chronicConditionSchema = Joi.object({
  conditionName: Joi.string().optional().allow(''),
  diagnosedDate: Joi.date().iso().optional().allow(null),
  medication: Joi.string().optional().allow(''),
  notes: Joi.string().optional().allow(''),
});

const medicalHistoryEventSchema = Joi.object({
  condition: Joi.string().optional().allow(''),
  facility: Joi.string().optional().allow(''),
  treatmentDate: Joi.date().iso().optional().allow(null),
  method: Joi.string().optional().allow(''),
  notes: Joi.string().allow('').optional().allow(''),
});

const visionCheckupSchema = Joi.object({
  checkupDate: Joi.date().iso().optional().allow(null),
  rightEyeVision: Joi.string().optional().allow(''),
  leftEyeVision: Joi.string().optional().allow(''),
  wearsGlasses: Joi.boolean().optional().allow(null),
  isColorblind: Joi.boolean().optional().allow(null),
  notes: Joi.string().allow('').optional(),
});

const hearingCheckupSchema = Joi.object({
  checkupDate: Joi.date().iso().optional().allow(null),
  rightEarStatus: Joi.string().optional().allow(''),
  leftEarStatus: Joi.string().optional().allow(''),
  usesHearingAid: Joi.boolean().optional().allow(null),
  notes: Joi.string().allow('').optional(),
});

const injectedVaccineSchema = Joi.object({
  vaccineName: Joi.string().optional().allow(''),
  doseNumber: Joi.number().integer().min(1).optional().allow(null),
  note: Joi.string().optional().allow(''),
  dateInjected: Joi.date().iso().optional().allow(null),
  locationInjected: Joi.string().optional().allow(''),
});


// 1. Validator cho việc tạo mới Health Profile
const createProfileSchema = Joi.object({
  studentId: objectIdValidator.label('Student ID'),
  
  // Áp dụng các schema con đã định nghĩa
  allergies: Joi.array().items(allergySchema).optional().default([]),
  chronicConditions: Joi.array().items(chronicConditionSchema).optional().default([]),
  medicalHistory: Joi.array().items(medicalHistoryEventSchema).optional().default([]),
  visionHistory: Joi.array().items(visionCheckupSchema).optional().default([]),
  hearingHistory: Joi.array().items(hearingCheckupSchema).optional().default([]),
  vaccines: Joi.array().items(injectedVaccineSchema).optional().default([]),
});


// 2. Validator cho việc cập nhật Health Profile
const updateProfileSchema = Joi.object({
  // Tất cả các trường đều là optional, nhưng nếu tồn tại, phải tuân theo schema con
  allergies: Joi.array().items(allergySchema).optional(),
  chronicConditions: Joi.array().items(chronicConditionSchema).optional(),
  medicalHistory: Joi.array().items(medicalHistoryEventSchema).optional(),
  visionHistory: Joi.array().items(visionCheckupSchema).optional(),
  hearingHistory: Joi.array().items(hearingCheckupSchema).optional(),
  vaccines: Joi.array().items(injectedVaccineSchema).optional(),

}).min(1).messages({
    'object.min': 'At least one field must be provided for update.'
});



export const claimStudentValidator = validate(claimStudentSchema);
export const createProfileValidator = validate(createProfileSchema);
export const updateProfileValidator = validate(updateProfileSchema);