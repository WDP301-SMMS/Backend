import { body } from 'express-validator';
import { CheckupItemDataType } from '@/enums/TemplateEnum';

export const templateValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
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
    .withMessage('Data type is required and must be a valid type'),
  body('checkupItems.*.unit')
    .optional()
    .isString()
    .withMessage('Unit must be a string if provided'),
  body('checkupItems.*.guideline')
    .optional()
    .isString()
    .withMessage('Guideline must be a string'),
];
