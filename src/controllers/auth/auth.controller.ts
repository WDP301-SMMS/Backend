import {
  generateGoogleAuthUrl,
  getGoogleUser,
} from '@/services/google.service';
import { NextFunction, Request, Response } from 'express';
import { UserModel } from '@models/user.model';
import {
  decryptToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@/utils/jwt';
import bcrypt from 'bcrypt';
import { handleSuccessResponse } from '@/utils/responseHandler';
import { validationResult } from 'express-validator';
import { IUser } from '@/interfaces/user.interface';
import sendEmail from '@/utils/email';
import NodeCache from 'node-cache';
import generateOtp from '@/utils/otp';

const otpCache = new NodeCache({ stdTTL: 300 });

// Login with Google OAuth
export const redirectToUri = (req: Request, res: Response) => {
  const silent = req.query.silent === 'true';

  const url = generateGoogleAuthUrl(silent);
  return res.redirect(url);
};

const handleGoogleCallback = async (req: Request, res: Response) => {
  const { code } = req.query;
  if (typeof code !== 'string') {
    return res.status(400).send('Invalid code');
  }

  try {
    const user = await getGoogleUser(code);
    if (!user?.email) {
      return res.status(400).send('Email không tồn tại từ Google');
    }

    let userInfo = await UserModel.findOne({ googleId: user.sub });

    if (!userInfo) {
      userInfo = await UserModel.findOne({ email: user.email });

      if (userInfo) {
        userInfo.googleId = user.sub;
        await userInfo.save();
      }
    }

    let isNewUser = false;

    if (!userInfo) {
      isNewUser = true;
      userInfo = new UserModel({
        email: user.email,
        username: user.name,
        password: null,
        dob: null,
        phone: null,
        authProvider: 'google',
        googleId: user.sub,
      });
      await userInfo.save();
    }

    const accessToken = generateAccessToken(userInfo);
    const refreshToken = generateRefreshToken(userInfo);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const hasMissingFields = !userInfo.dob || !userInfo.phone;

    res.send(`
      <script>
        window.opener.postMessage(
          {
            accessToken: "${accessToken}",
            hasMissingFields: ${hasMissingFields},
            isNewUser: ${isNewUser}
          },
          "${process.env.FRONTEND_URL}"
        );
        window.close();
      </script>
    `);
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isActive = user?.isActive;
    if (!isActive) {
      res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user?.password as string);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const accessToken = generateAccessToken(user as IUser);
    const refreshToken = generateRefreshToken(user as IUser);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    handleSuccessResponse(res, 200, 'Login Successfully', {
      accessToken,
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const registerWithJwt = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const body = req.body;
  try {
    const existingUser = await UserModel.findOne({ email: body.email });
    if (existingUser) {
      res
        .status(400)
        .json({ success: false, message: 'Account already exists' });
      return;
    }

    const newUser = await UserModel.create({
      ...body,
      password: body.password ? await bcrypt.hash(body.password, 10) : '',
      isActive: false,
    });

    const verifyCode = generateAccessToken(newUser);
    const verifyLink = `${process.env.BASE_URL}/api/auth/verify-email?code=${verifyCode}`;

    try {
      await sendEmail(
        body.email,
        'Verify your email',
        `Click the link to verify your email: ${verifyLink}`,
      );
    } catch (emailError) {
      console.warn('Failed to send verification email:', emailError);
    }

    handleSuccessResponse(
      res,
      201,
      'User registered successfully, please verify your email',
    );
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    res
      .status(401)
      .json({ success: false, message: 'Refresh token has expired' });
    return;
  }
  try {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      res
        .status(401)
        .json({ success: false, message: 'Invalid refresh token' });
      return;
    }
    const accessToken = generateAccessToken(payload);

    handleSuccessResponse(
      res,
      200,
      'Generate access token successfully',
      accessToken,
    );
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const VerifyRegisterEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { code } = req.query;
  if (typeof code !== 'string') {
    res
      .status(400)
      .json({ success: false, message: 'Invalid verification code' });
    return;
  }

  try {
    const decodedToken = decryptToken(code);
    if (!decodedToken || !decodedToken.email) {
      res
        .status(400)
        .json({ success: false, message: 'Invalid verification code' });
      return;
    }

    const user = await UserModel.findOne({ email: decodedToken.email });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.isActive = true;
    await user.save();

    res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    if (!user.isActive) {
      res
        .status(401)
        .json({ success: false, message: 'Please verify your email first' });
      return;
    }

    const otp = generateOtp();
    await sendEmail(email, 'Reset your password', `Your OTP is: ${otp}`);
    otpCache.set(email, otp, 300);

    handleSuccessResponse(res, 200, 'OTP sent to your email successfully');
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    const { email, token } = req.body;

    const cachedOtp = otpCache.get(email);
    if (!cachedOtp) {
      res
        .status(400)
        .json({ success: false, message: 'OTP expired or invalid' });
      return;
    }
    if (cachedOtp !== token) {
      res.status(400).json({ success: false, message: 'Invalid OTP' });
      return;
    }

    const resetToken = generateOtp();
    otpCache.set(`reset_${email}`, resetToken, 300);
    otpCache.del(email);

    handleSuccessResponse(res, 200, 'OTP verified successfully', {
      resetToken,
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    const { email, resetToken, newPassword } = req.body;

    const cachedToken = otpCache.get(`reset_${email}`);
    if (!cachedToken || cachedToken !== resetToken) {
      res
        .status(401)
        .json({ success: false, message: 'Invalid or expired reset token' });
      return;
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    if (!user.isActive) {
      res
        .status(401)
        .json({ success: false, message: 'Please verify your email first' });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    otpCache.del(`reset_${email}`);

    handleSuccessResponse(res, 200, 'Password reset successfully');
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const logout = async (req: Request, res: Response) => {
  console.log('refreshToken', req.cookies.refreshToken);
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
    });

    handleSuccessResponse(res, 200, 'Logout successfully');
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
export const authController = {
  redirectToUri,
  handleGoogleCallback,
  loginWithJwt,
  registerWithJwt,
  refreshToken,
  VerifyRegisterEmail,
  verifyOTP,
  forgotPassword,
  resetPassword,
  logout,
};
