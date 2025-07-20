import Joi, { ObjectSchema, ArraySchema, Schema } from 'joi';
import { SlotEnum } from '@/enums/SlotEnum';
import { MedicationScheduleEnum } from '@/enums/MedicationEnum';
import { Request, Response, NextFunction } from 'express';

// Validator cho MongoDB ObjectId
const objectIdValidator = Joi.string().hex().length(24).required();

// Middleware chung cho cả ObjectSchema và ArraySchema
const validate =
  (
    schema: Schema, // dùng Schema để chấp nhận cả object & array
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return res
        .status(400)
        .json({ message: 'Validation failed', errors: details });
    }

    req.body = value;
    next();
  };

// Schema cho tạo lịch uống thuốc
const createScheduleSchema = Joi.object({
  medicationRequestId: objectIdValidator,
  sessionSlots: Joi.string()
    .valid(...Object.values(SlotEnum))
    .required(),
  date: Joi.date().iso().required(),
});

// Schema cho cập nhật trạng thái lịch uống thuốc
const updateScheduleStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      MedicationScheduleEnum.Done,
      MedicationScheduleEnum.Not_taken,
      MedicationScheduleEnum.Cancelled,
    )
    .required(),
  reason: Joi.when('status', {
    is: Joi.valid(
      MedicationScheduleEnum.Not_taken,
      MedicationScheduleEnum.Cancelled,
    ),
    then: Joi.string().required().messages({
      'any.required':
        'Reason is required when status is NotTaken or Cancelled.',
    }),
    otherwise: Joi.forbidden(),
  }),
});

// Export middleware đã gắn schema
export const validateCreateSchedule = validate(
  Joi.array().items(createScheduleSchema).min(1),
);

export const validateUpdateScheduleStatus = validate(
  updateScheduleStatusSchema,
);
