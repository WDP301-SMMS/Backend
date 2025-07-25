import { IUser } from '@/interfaces/user.interface';
import { AppError } from '@/utils/globalErrorHandler';
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

// const roleBaseAccess = (role: string[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const token = req.token || req.headers['authorization']?.split(' ')[1];
//     if (!token) {
//       res.status(401).json({ success: false, message: 'No token provided' });
//       return;
//     }

//     const decodedToken = decryptToken(token);
//     if (!decodedToken) {
//       res.status(403).json({ success: false, message: 'Invalid token' });
//       return;
//     }

//     const userRole = decodedToken.role;
//     if (!userRole) {
//       res
//         .status(403)
//         .json({ success: false, message: 'Access denied, no role found' });
//       return;
//     }

//     if (!role.includes(userRole)) {
//       res.status(403).json({
//         success: false,
//         message: 'Access denied, insufficient permissions',
//       });
//       return;
//     }

//     next();
//   };
// };

const roleBaseAccess = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    
    if (!userRole || !roles.includes(userRole)) {
      const error: AppError = new Error('Access denied, you do not have permission to perform this action.');
      error.status = 403; // Forbidden
      return next(error);
    }
    next();
  };
};

// const handleToken = (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const token = req.headers['authorization']?.split(' ')[1];
//     if (!token) {
//       res.status(401).json({ success: false, message: 'No token provided' });
//       return;
//     }

//     const verifiedToken = verifyAccessToken(token);
//     if (verifiedToken) {
//       req.token = token;
//       next();
//     } else {
//       handleRefreshToken(req, res, next);
//     }
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Authentication error',
//       error: (error as Error).message,
//     });
//   }
// };

const handleToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      const error: AppError = new Error('Authentication token missing or malformed.');
      error.status = 401;
      return next(error);
    }
    
    const token = authorization.split(' ')[1];
    if (!token) {
        const error: AppError = new Error('Authentication token missing.');
        error.status = 401;
        return next(error);
    }

    const decodedUser = verifyAccessToken(token) as IUser | null;
    
    if (decodedUser) {
      req.user = decodedUser;
      req.token = token; 
      next(); 
    } else {

      handleRefreshToken(req, res, next); 
    }
  } catch (error) {
    next(error); 
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
      res
        .status(401)
        .json({ success: false, message: 'No refresh token provided' });
      return;
    }

    const verifiedRefreshToken = verifyRefreshToken(refreshToken);
    if (!verifiedRefreshToken) {
      res
        .status(403)
        .json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    const newAccessToken = generateAccessToken(verifiedRefreshToken);
    req.user = verifiedRefreshToken;
    req.token = newAccessToken;

    handleSuccessResponse(res, 200, 'New access token generated', {
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Token refresh error',
      error: (error as Error).message,
    });
  }
};

export { handleToken, roleBaseAccess };
