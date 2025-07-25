import { param, body } from 'express-validator';

export const validateRoomId = [
  param('roomId')
    .notEmpty()
    .withMessage('Room ID is required')
    .isString()
    .withMessage('Room ID must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Room ID must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage('Room ID can only contain letters, numbers, hyphens, and underscores'),
];

export const validateUserId = [
  param('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
];

export const validateCreateRoom = [
  body('participantId')
    .notEmpty()
    .withMessage('Participant ID is required')
    .isMongoId()
    .withMessage('Participant ID must be a valid MongoDB ObjectId'),
];
