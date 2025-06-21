import { handleToken } from '@/middlewares/security/authorization';
import {
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
  verifyOTPValidator,
} from '@/validators/authValidator';
import { authController } from '@controllers/auth/auth.controller';
import { Router } from 'express';

export const authRouter = Router();

const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Define routes for Google authentication
authRouter.get('/google', asyncHandler(authController.redirectToUri));
authRouter.get(
  '/google/callback',
  asyncHandler(authController.handleGoogleCallback),
);

// Define routes for JWT authentication
authRouter.post(
  '/login',
  loginValidator,
  asyncHandler(authController.loginWithJwt),
);
authRouter.post(
  '/register',
  registerValidator,
  asyncHandler(authController.registerWithJwt),
);

// refresh token route
authRouter.post('/refresh-token', asyncHandler(authController.refreshToken));

// Verify email registration
authRouter.get(
  '/verify-email',
  asyncHandler(authController.VerifyRegisterEmail),
);

// forgot password
authRouter.post(
  '/forgot-password',
  forgotPasswordValidator,
  asyncHandler(authController.forgotPassword),
);
authRouter.post(
  '/verify-otp',
  verifyOTPValidator,
  asyncHandler(authController.verifyOTP),
);
authRouter.post(
  '/reset-password',
  resetPasswordValidator,
  asyncHandler(authController.resetPassword),
);

// logout route
authRouter.post('/logout', handleToken, asyncHandler(authController.logout));
