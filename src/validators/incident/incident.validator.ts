import { Request, Response, NextFunction, RequestHandler } from 'express';
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

const incidentSchema = Joi.object({
  studentId: objectIdValidator.required(),
  incidentType: Joi.string().required(),
  description: Joi.string().required(),
  severity: Joi.string().required(),
  actionsTaken: Joi.string().required(),
  note: Joi.string().optional().allow(null, ''),
  incidentTime: Joi.date().required(),
});

export const validateIncident = validate(incidentSchema);
