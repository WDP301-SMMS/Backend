import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const objectIdValidator = Joi.string().hex().length(24);

const validate =
  (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      res.status(400).json({
        message: 'Validation failed',
        errors: details,
      });
      return;
    }

    req.body = value;
    next();
  };

const requestSchema = Joi.object({
  parentId: objectIdValidator.required(),
  studentId: objectIdValidator.required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  prescriptionFile: Joi.string().uri().required().messages({
    'string.uri': 'Prescription file must be a valid URL.',
    'any.required': 'Prescription file is required.',
  }),
  items: Joi.array()
    .items(
      Joi.object({
        medicationName: Joi.string().required(),
        dosage: Joi.string().required(),
        instruction: Joi.string().required(),
      }),
    )
    .min(1)
    .required(),
});

const updateRequestSchema = Joi.object({
  parentId: objectIdValidator.optional(),
  studentId: objectIdValidator.optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).optional(),
  prescriptionFile: Joi.string().uri().optional(),
  status: Joi.string()
    .valid('Pending', 'Scheduled', 'Completed', 'Rejected')
    .optional(),
});

const updateItemsSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string().hex().length(24), // optional – nếu có thì update, không có thì thêm mới
        medicationName: Joi.string().required(),
        dosage: Joi.string().required(),
        instruction: Joi.string().required(),
      }),
    )
    .min(1)
    .required(),
});

export const validateUpdateRequestItems = validate(updateItemsSchema);
export const validateUpdateRequest = validate(updateRequestSchema);
export const validateMedicationRequest = validate(requestSchema);
