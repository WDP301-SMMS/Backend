import { IUser } from '@/interfaces/user.interface';
import { UserModel } from '@/models/user.model';
import { AppError } from '@/utils/globalErrorHandler';

export class UserService {

  public async findUserById(userId: string): Promise<IUser> {
    const user = await UserModel.findById(userId).select('-password'); // Loại bỏ trường password
    if (!user) {
      const error: AppError = new Error('User not found.');
      error.status = 404;
      throw error;
    }
    return user;
  }

  public async registerPushToken(userId: string, token: string): Promise<void> {
    if (!userId || !token) {
      console.warn('Attempted to register push token with empty userId or token.');
      return;
    }

    await UserModel.updateOne(
      { _id: userId },
      { $addToSet: { pushTokens: token } }
    );
  }

  public async unregisterPushToken(userId: string, token: string): Promise<void> {
    if (!userId || !token) {
      console.warn('Attempted to unregister push token with empty userId or token.');
      return;
    }

    await UserModel.updateOne(
      { _id: userId },
      { $pull: { pushTokens: token } }
    );
  }
}