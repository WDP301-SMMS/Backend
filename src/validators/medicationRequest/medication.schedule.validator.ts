import { Request, Response, NextFunction, RequestHandler } from 'express';
import { MedicationScheduleEnum } from '@/enums/MedicationEnum';
import { SlotEnum } from '@/enums/SlotEnum';
import Joi from 'joi';

const objectIdValidator = Joi.string().hex().length(24);

const validate = (schema: Joi.ObjectSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      res.status(400).json({ message: 'Validation failed', errors: details });
      return;
    }

    req.body = value;
    next();
  };
};

const scheduleArraySchema = Joi.object({
  schedules: Joi.array()
    .items(
      Joi.object({
        medicationRequestId: objectIdValidator.required(),
        studentId: objectIdValidator.required(),
        nurseId: objectIdValidator.required(),
        sessionSlots: Joi.string()
          .valid(...Object.values(SlotEnum))
          .required(),
        status: Joi.string()
          .valid(...Object.values(MedicationScheduleEnum))
          .default(MedicationScheduleEnum.Pending),
      }),
    )
    .required(),
});

const updateStatusSchema = Joi.object({
  nurseId: objectIdValidator.required(),
  status: Joi.string()
    .valid(...Object.values(MedicationScheduleEnum))
    .required(),
  reason: Joi.when('status', {
    is: Joi.valid('cancelled', 'skipped'),
    then: Joi.string().required().messages({
      'any.required': 'Reason is required when status is cancelled or skipped.',
    }),
    otherwise: Joi.forbidden(),
  }),
});

export const validateUpdateStatus = validate(updateStatusSchema);
export const validateScheduleArray = validate(scheduleArraySchema);
