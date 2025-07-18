import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

const validate =
  (schema: Joi.ObjectSchema, property: 'params' | 'query' | 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const errorDetails = error.details.map(d => ({
        message: d.message,
        field: d.path.join('.'),
      }));
      // BỎ TỪ KHÓA 'return' Ở ĐÂY
      res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errorDetails,
      });
      // Không cần return vì res.json() đã kết thúc response.
    } else {
        next();
    }
  };

const markAsReadParamsSchema = Joi.object({
  notificationId: Joi.string().hex().length(24).required().messages({
    'string.pattern.base': 'Notification ID must be a valid ObjectId.',
    'any.required': 'Notification ID is required in URL parameters.',
  }),
});

export const validateMarkAsRead = validate(markAsReadParamsSchema, 'params');