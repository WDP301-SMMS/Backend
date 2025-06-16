import { IUser } from '@/interfaces/user.interface';
import jwt from 'jsonwebtoken';

export const generateAccessToken = (user: IUser): string => {
  return jwt.sign(
    { role: user.role, username: user.username },
    process.env.JWT_SECRET as string,
    { expiresIn: '30m' },
  );
};

export const generateRefreshToken = (user: IUser): string => {
  return jwt.sign(
    { role: user.role, username: user.username },
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: '7d',
    },
  );
};

export const verifyAccessToken = (token: string): IUser | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as IUser;
  } catch (error) {
    console.error('Invalid access token:', error);
    return null;
  }
};

export const verifyRefreshToken = (token: string): IUser | null => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as IUser;
  } catch (error) {
    console.error('Invalid refresh token:', error);
    return null;
  }
};
