import {
  generateGoogleAuthUrl,
  getGoogleUser,
} from '@/services/authenticateWithGoogle';
import { NextFunction, Request, Response } from 'express';
import User from '@models/user.model';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@/utils/jwt';
import bcrypt from 'bcrypt';

// Login with Google OAuth
const redirectToUri = (req: Request, res: Response) => {
  const url = generateGoogleAuthUrl();
  res.redirect(url);
};

const handleGoogleCallback = async (req: Request, res: Response) => {
  const { code } = req.query;
  if (typeof code !== 'string') {
    res.status(400).send('Invalid code');
    return;
  }

  try {
    const user = await getGoogleUser(code);

    const existingUser = await User.findOne({ googleId: user?.sub });
    let finalUser = existingUser;
    if (!existingUser) {
      const newUser = new User({
        email: user?.email,
        username: user?.name,
        authProvider: 'google',
        googleId: user?.sub,
      });

      await newUser.save();
      finalUser = newUser;
    }
    if (!finalUser) {
      res.status(500).send('Failed to create or find user');
      return;
    }
    const accessToken = generateAccessToken(finalUser);
    const refreshToken = generateRefreshToken(finalUser);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({
      accessToken,
    });
  } catch (error) {
    console.error('Error retrieving Google user:', error);
    res.status(500).send('Internal Server Error');
  }
};

// login with JWT
const loginWithJwt = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const registerWithJwt = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const body = req.body;
  try {
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Account already exists' });
    }
    await User.create({
      ...body,
      password: body.password
        ? await bcrypt.hash(body.password, 10)
        : undefined,
    });

    res.json({
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token has expired' });
  }
  try {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    const accessToken = generateAccessToken(payload);

    res.json({
      accessToken,
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const authController = {
  redirectToUri,
  handleGoogleCallback,
  loginWithJwt,
  registerWithJwt,
  refreshToken,
};
