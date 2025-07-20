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

const createBlogSchema = Joi.object({
  title: Joi.string().min(10).max(255).required().messages({
    'string.empty': 'Title is required.',
    'string.min': 'Title must be at least 10 characters long.',
    'string.max': 'Title cannot be longer than 255 characters.',
  }),
   coverImageUrl: Joi.string().uri().required().messages({ 
    'string.empty': 'Cover image URL is required.',
    'string.uri': 'Cover image must be a valid URL.',
    'any.required': 'Cover image URL is required.',
  }),
  content: Joi.string().min(50).required().messages({
    'string.empty': 'Content is required.',
    'string.min': 'Content must be at least 50 characters long.',
  }),
  publishedAt: Joi.date().iso().required().messages({
    'date.format': 'Published date must be in a valid ISO format (YYYY-MM-DD).',
    'any.required': 'Published date is required.',
  }),
});

const updateBlogSchema = Joi.object({
  title: Joi.string().min(10).max(255).optional(),
  coverImageUrl: Joi.string().uri().optional(),
  content: Joi.string().min(50).optional(),
  publishedAt: Joi.date().iso().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided to update.',
});

export const createBlogValidator = validate(createBlogSchema);
export const updateBlogValidator = validate(updateBlogSchema);