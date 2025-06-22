import { IUser } from '@/interfaces/user.interface';
import jwt from 'jsonwebtoken';

export const generateAccessToken = (user: IUser): string => {
  return jwt.sign(
    {
      email: user.email,
      _id: user._id,
      role: user.role,
      username: user.username,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '1d' },
  );
};

export const generateRefreshToken = (user: IUser): string => {
  return jwt.sign(
    {
      email: user.email,
      _id: user._id,
      role: user.role,
      username: user.username,
    },
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

export const decryptToken = (token: string): IUser | null => {
  try {
    return jwt.decode(token) as IUser;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};
