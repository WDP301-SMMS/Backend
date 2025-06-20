import { differenceInYears, isValid, parse } from 'date-fns';
import { body } from 'express-validator';

export const registerValidator = [
  body('email')
    .notEmpty()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .trim(),
  body('username').notEmpty().withMessage('Username is required'),
  body('dob')
    .notEmpty()
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
    .notEmpty()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Phone number must be a valid mobile number'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm Password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
    .trim(),
];

export const loginValidator = [
  body('email')
    .notEmpty()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage('Password is required')
    .trim(),
];

export const resetPasswordValidator = [
  body('newPassword')
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .trim(),
  body('confirmNewPassword')
    .notEmpty()
    .withMessage('Confirm new password is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New passwords do not match');
      }
      return true;
    })
    .trim(),
];

export const forgotPasswordValidator = [
  body('email')
    .notEmpty()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
];

export const verifyOTPValidator = [
  body('email')
    .notEmpty()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('token')
    .notEmpty()
    .isNumeric()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be a 6-digit numeric value'),
];

export const resetPasswordOtpValidator = [
  body('email')
    .notEmpty()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('resetToken')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('confirmNewPassword')
    .notEmpty()
    .withMessage('Confirm new password is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New passwords do not match');
      }
      return true;
    }),
];
