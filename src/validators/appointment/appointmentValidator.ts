import { body, param, query } from 'express-validator';
import { AppointmentStatus } from '@/enums/AppointmentEnums';

export const createAppointmentValidator = [
  body('studentId')
    .notEmpty()
    .withMessage('Student ID is required')
    .isMongoId()
    .withMessage('Student ID must be a valid MongoDB ObjectId'),

  body('parentId')
    .notEmpty()
    .withMessage('Parent ID is required')
    .isMongoId()
    .withMessage('Parent ID must be a valid MongoDB ObjectId'),

  body('resultId')
    .optional()
    .isMongoId()
    .withMessage('Result ID must be a valid MongoDB ObjectId'),

  body('meetingTime')
    .notEmpty()
    .withMessage('Meeting time is required')
    .isISO8601()
    .withMessage('Meeting time must be a valid date')
    .custom((value) => {
      const meetingDate = new Date(value);
      const now = new Date();
      if (meetingDate <= now) {
        throw new Error('Meeting time must be in the future');
      }
      return true;
    }),

  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isString()
    .withMessage('Location must be a string')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Location must be between 3 and 200 characters'),

  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

export const updateAppointmentStatusValidator = [
  param('appointmentId')
    .notEmpty()
    .withMessage('Appointment ID is required')
    .isMongoId()
    .withMessage('Appointment ID must be a valid MongoDB ObjectId'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(AppointmentStatus))
    .withMessage(
      `Status must be one of: ${Object.values(AppointmentStatus).join(', ')}`,
    ),

  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
];

export const respondToAppointmentValidator = [
  param('appointmentId')
    .notEmpty()
    .withMessage('Appointment ID is required')
    .isMongoId()
    .withMessage('Appointment ID must be a valid MongoDB ObjectId'),

  body('action')
    .notEmpty()
    .withMessage('Action is required')
    .isIn(['COMPLETED', 'CANCELLED'])
    .withMessage('Action must be either "COMPLETED" or "CANCELLED"'),

  body('reason')
    .if(body('action').equals('CANCELLED'))
    .notEmpty()
    .withMessage('Reason is required when declining an appointment')
    .isString()
    .withMessage('Reason must be a string')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Reason must be between 3 and 500 characters'),
];

export const getAppointmentsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(Object.values(AppointmentStatus))
    .withMessage(
      `Status must be one of: ${Object.values(AppointmentStatus).join(', ')}`,
    ),

  query('studentId')
    .optional()
    .isMongoId()
    .withMessage('Student ID must be a valid MongoDB ObjectId'),
];

export const updateAppointmentNotesValidator = [
  param('appointmentId')
    .notEmpty()
    .withMessage('Appointment ID is required')
    .isMongoId()
    .withMessage('Appointment ID must be a valid MongoDB ObjectId'),

  body('afterMeetingNotes')
    .notEmpty()
    .withMessage('After meeting notes are required')
    .isString()
    .withMessage('After meeting notes must be a string')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('After meeting notes must be between 10 and 2000 characters'),
];
