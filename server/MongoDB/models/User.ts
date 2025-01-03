import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  username: string;
  email?: string;
  walletAddress: string;
  createdAt: Date;
}

const UserSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: false },
  walletAddress: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const UserModel = mongoose.model<IUser>("User", UserSchema, "users");
export default UserModel;
