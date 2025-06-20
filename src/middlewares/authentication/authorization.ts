import {
  decryptToken,
  generateAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '@/utils/jwt';
import { handleSuccessResponse } from '@/utils/responseHandler';
import { NextFunction, Request, Response } from 'express';

// Extend Express Request interface to include 'token'
declare global {
  namespace Express {
    interface Request {
      token?: string;
    }
  }
}

const roleBaseAccess = (role: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.token || req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'No token provided' });
    }

    const decodedToken = decryptToken(token);
    if (!decodedToken) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }

    const userRole = decodedToken.role;
    if (!userRole) {
      return res
        .status(403)
        .json({ success: false, message: 'Access denied, no role found' });
    }

    if (!role.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied, insufficient permissions',
      });
    }

    next();
  };
};

const handleToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'No token provided' });
    }

    const verifiedToken = verifyAccessToken(token);
    if (verifiedToken) {
      req.token = token;
      return next();
    } else {
      return handleRefreshToken(req, res, next);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: (error as Error).message,
    });
  }
};

const handleRefreshToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: 'No refresh token provided' });
    }

    const verifiedRefreshToken = verifyRefreshToken(refreshToken);
    if (!verifiedRefreshToken) {
      return res
        .status(403)
        .json({ success: false, message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(verifiedRefreshToken);
    req.token = newAccessToken;

    handleSuccessResponse(res, 200, 'New access token generated', {
      accessToken: newAccessToken,
    });

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Token refresh error',
      error: (error as Error).message,
    });
  }
};

export { handleToken, roleBaseAccess };
