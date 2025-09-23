import mongoose, { Schema, Document } from "mongoose";
import { Message, MessageSchema } from "./Message";

interface User extends Document {
    username: string;
    email: string;
    password: string;
    isVerified: boolean;
    verificationCode: string;
    codeExpiry: Date;
    isAcceptingMessages: boolean;
    messages: Message[];
}

const UserSchema: Schema<User> = new Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            trim: true,
            unique: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            unique: true,
            match: [/.+\@.+\..+/, "Please enter a valid email"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        isVerified: {
            type: Boolean,
            required: true,
            default: false,
        },
        verificationCode: {
            type: String,
        },
        codeExpiry: {
            type: Date,
        },
        isAcceptingMessages: {
            type: Boolean,
            required: true,
            default: true,
        },
        messages: {
            type: [MessageSchema],
        },
    },
    {
        timestamps: true,
    }
);

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema);

export default UserModel;