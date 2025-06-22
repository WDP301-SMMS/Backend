import { body } from 'express-validator';
import { CheckupItemDataType, CheckupItemUnit } from '@/enums/TemplateEnum';

export const templateValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description is required'),
  body('checkupItems')
    .notEmpty()
    .isArray()
    .withMessage('Checkup items must be an array'),
  body('checkupItems.*.itemName')
    .notEmpty()
    .withMessage('Item name is required'),
  body('checkupItems.*.dataType')
    .notEmpty()
    .isIn(Object.values(CheckupItemDataType))
    .withMessage('Data type is required and must be a valid type')
    .toUpperCase(),
  body('checkupItems.*.unit')
    .notEmpty()
    .isIn(Object.values(CheckupItemUnit))
    .withMessage('Unit must be a string if provided')
    .toUpperCase(),
  body('checkupItems.*.guideline')
    .optional()
    .isString()
    .withMessage('Guideline must be a string'),
];
