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
authRouter.get('/google/callback', asyncHandler(authController.handleGoogleCallback));

// Define routes for JWT authentication
authRouter.post('/login', asyncHandler(authController.loginWithJwt));
authRouter.post('/register', asyncHandler(authController.registerWithJwt));

// refresh token route
authRouter.post('/refresh-token', asyncHandler(authController.refreshToken));