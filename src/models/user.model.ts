import mongoose, { Schema, Document } from 'mongoose';
import { RoleEnum } from '@/enums/RoleEnum';
import { IUser } from '@/interfaces/user.interface';
import bcrypt from 'bcrypt';

const UserSchema = new Schema<IUser>(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    username: {
      type: String,
      required: [
        function (this: IUser) {
          return this.authProvider === 'local';
        },
        'Username is required for local authentication',
      ],
      trim: true,
    },
    password: {
      type: String,
      required: [
        function (this: IUser) {
          return this.authProvider === 'local';
        },
        'Password is required for local authentication',
      ],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.Parent,
      required: true,
    },
    dob: {
      type: Date,
      required: [
        function (this: mongoose.Document & { authProvider?: string }) {
          return this.authProvider === 'local';
        },
        'Date of Birth is required for local authentication',
      ],
    },
    phone: {
      type: String,
      required: [
        function (this: IUser) {
          return this.authProvider === 'local';
        },
        'Phone is required for local authentication',
      ],
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      required: true,
      default: 'local',
    },
  },
  { timestamps: true, collection: 'User' },
);

const UserModel = mongoose.model<IUser>('User', UserSchema);
export default UserModel;
