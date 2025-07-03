import { InventoryLogType, InventoryType } from '@/enums/InventoryEnums';
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const objectIdValidator = Joi.string().hex().length(24).messages({
  'string.pattern.base': `"{#label}" must be a valid MongoDB ObjectId.`,
});

const validate =
  (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map(d => ({
        message: d.message,
        field: d.path.join('.'),
      }));
      res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errorDetails,
      });
    } else {
      req[property] = value;
      next();
    }
  };

const stockInItemSchema = Joi.object({
  itemName: Joi.string().min(2).max(100).required(),
  unit: Joi.string().required(),
  type: Joi.string().required().valid(...Object.values(InventoryType)),
  description: Joi.string().allow('').max(500).optional(),
  lowStockThreshold: Joi.number().integer().min(0).required(),
  quantity: Joi.number().positive().required(),
  expirationDate: Joi.date().iso().required(),
});

const updateItemSchema = Joi.object({
  itemName: Joi.string().min(2).max(100).optional(),
  unit: Joi.string().optional(),
  lowStockThreshold: Joi.number().integer().min(0).optional(),
  description: Joi.string().allow('').max(500).optional(),
  type: Joi.string().valid(...Object.values(InventoryType)).optional(),
}).min(1);

const dispenseItemSchema = Joi.object({
  itemId: objectIdValidator.required().label('Item ID'),
  quantityToWithdraw: Joi.number().positive().required(),
  usageInstructions: Joi.string().allow('').max(500).optional(),
});

const dispenseMedicationSchema = Joi.object({
  dispensedItems: Joi.array().items(dispenseItemSchema).min(1).required().messages({
    'array.min': 'At least one item must be dispensed.',
  }),
});

const adjustStockSchema = Joi.object({
  itemId: objectIdValidator.required().label('Item ID'),
  batchId: objectIdValidator.required().label('Batch ID'),
  newQuantity: Joi.number().integer().min(0).required(),
  reason: Joi.string().min(5).required(),
  type: Joi.string()
    .required()
    .valid(
      InventoryLogType.MANUAL_ADJUSTMENT,
      InventoryLogType.DISPOSE_EXPIRED,
    ),
});

export const stockInItemValidator = validate(stockInItemSchema);
export const updateItemValidator = validate(updateItemSchema);
export const dispenseMedicationValidator = validate(dispenseMedicationSchema);
export const adjustStockValidator = validate(adjustStockSchema);