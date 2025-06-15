import mongoose, { Schema } from "mongoose";
import { IUser } from "@/interfaces/user.interface";
import { RoleEnum } from "../enums/RoleEnum";


const UserSchema: Schema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: Object.values(RoleEnum),
        default: RoleEnum.Parent,
        required: true
    },
    dob: {
        type: Date,
        required: [true, "Date of Birth is required"],
    },
    phone: {
        type: String,
        required: [true, "Phone is required"],
    },
    isActive: {
        type: Boolean,
        required: true
    },
});

export const UserModel = mongoose.model<IUser>("User", UserSchema);