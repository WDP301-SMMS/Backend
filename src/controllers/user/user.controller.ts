import { handleSuccessResponse } from '@/utils/responseHandler';
import { UserModel } from '@models/user.model';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { decryptToken } from '@/utils/jwt';

const getUser = async (req: Request, res: Response) => {
  const token = req.token as string;
  const decodedToken = decryptToken(token);
  try {
    const user = await UserModel.findById(decodedToken?._id).select(
      '-password',
    );
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    handleSuccessResponse(res, 200, 'User retrieved successfully', user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const editProfile = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const token = req.token as string;
  const decodedToken = decryptToken(token);
  if (!token || !decodedToken) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const body = req.body;
  try {
    const user = await UserModel.findOneAndUpdate(
      { _id: decodedToken?._id },
      { ...body },
      { new: true, runValidators: true },
    ).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    handleSuccessResponse(res, 200, 'User profile updated successfully', user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePassword = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const token = req.token as string;
  const decodedToken = decryptToken(token);
  if (!token || !decodedToken) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await UserModel.findById(decodedToken._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password as string,
    );
    if (!isMatch) {
      res
        .status(400)
        .json({ success: false, message: 'Current password is incorrect' });
      return;
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    handleSuccessResponse(res, 200, 'Password updated successfully');
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateCompleteProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const token = req.token as string;
  const decodedToken = decryptToken(token);
  if (!token || !decodedToken) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { password, dob, phone } = req.body;

  try {
    const user = await UserModel.findById(decodedToken._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    user.dob = dob;
    user.phone = phone;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: 'Profile completed successfully', user });
  } catch (error) {
    console.error('Error completing profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export { getUser, editProfile, updatePassword, updateCompleteProfile };
