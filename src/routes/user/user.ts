import {
  editProfile,
  getUser,
  updatePassword,
} from '@/controllers/user/user.controller';
import {
  editProfileValidator,
  updatePasswordValidator,
} from '@/validators/userValidator';
import { Router } from 'express';

const userRouter = Router();

userRouter.get('/me', getUser);
userRouter.put('/me', editProfileValidator, editProfile);
userRouter.patch('/me/change-password', updatePasswordValidator, updatePassword);

export default userRouter;
