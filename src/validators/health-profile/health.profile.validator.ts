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
  type: Joi.string().required(),
  reaction: Joi.string().required(),
  severity: Joi.string().valid(...Object.values(EAllergySeverity)).required(),
  notes: Joi.string().required(),
});

const chronicConditionSchema = Joi.object({
  conditionName: Joi.string().required(),
  diagnosedDate: Joi.date().iso().optional(),
  medication: Joi.string().required(),
  notes: Joi.string().required(),
});

const medicalHistoryEventSchema = Joi.object({
  condition: Joi.string().required(),
  facility: Joi.string().required(),
  treatmentDate: Joi.date().iso().required(),
  method: Joi.string().required(),
  notes: Joi.string().allow('').optional(),
});

const visionCheckupSchema = Joi.object({
  checkupDate: Joi.date().iso().required(),
  rightEyeVision: Joi.string().required(),
  leftEyeVision: Joi.string().required(),
  wearsGlasses: Joi.boolean().required(),
  isColorblind: Joi.boolean().required(),
  notes: Joi.string().allow('').optional(),
});

const hearingCheckupSchema = Joi.object({
  checkupDate: Joi.date().iso().required(),
  rightEarStatus: Joi.string().required(),
  leftEarStatus: Joi.string().required(),
  usesHearingAid: Joi.boolean().required(),
  notes: Joi.string().allow('').optional(),
});

const injectedVaccineSchema = Joi.object({
  vaccineName: Joi.string().required(),
  doseNumber: Joi.number().integer().min(1).required(),
  note: Joi.string().required(),
  dateInjected: Joi.date().iso().required(),
  locationInjected: Joi.string().required(),
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