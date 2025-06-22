import { differenceInYears, isValid, parse } from 'date-fns';
import { body } from 'express-validator';

const editProfileValidator = [
  body('username').optional().isString().withMessage('Username must be a string'),
  body('gender').optional().isString().withMessage('Gender must be a string').toUpperCase(),
  body('dob')
    .optional()
    .custom((value) => {
      const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
      if (!isValid(parsedDate)) {
        throw new Error(
          'Date of Birth must be in DD/MM/YYYY format (e.g., 31/12/2000)',
        );
      }

      const age = differenceInYears(new Date(), parsedDate);
      if (age <= 18) {
        throw new Error('You must be over 18 years old');
      }

      return true;
    })
    .customSanitizer((value) => {
      return parse(value, 'dd/MM/yyyy', new Date());
    })
    .withMessage('Date of Birth must be a valid date in DD/MM/YYYY format'),
  body('phone')
    .optional()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Phone number must be a valid mobile number'),
];

const updatePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current Password is required')
    .trim(),
  body('newPassword')
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage('New Password must be at least 6 characters long')
    .trim(),
  body('confirmNewPassword')
    .notEmpty()
    .withMessage('Confirm New Password is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New passwords do not match');
      }
      return true;
    })
    .trim(),
];

export { editProfileValidator, updatePasswordValidator };
