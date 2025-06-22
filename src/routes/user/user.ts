import {
  editProfile,
  getUser,
  updatePassword,
  updateCompleteProfile,
} from '@/controllers/user/user.controller';
import {
  editProfileValidator,
  updatePasswordValidator,
  completeProfileValidator,
} from '@/validators/userValidator';
import { Router } from 'express';

const userRouter = Router();

userRouter.get('/me', getUser);
userRouter.put(
  '/complete-profile',
  completeProfileValidator,
  updateCompleteProfile,
);
userRouter.put('/me', editProfileValidator, editProfile);
userRouter.patch(
  '/me/change-password',
  updatePasswordValidator,
  updatePassword,
);

export default userRouter;
