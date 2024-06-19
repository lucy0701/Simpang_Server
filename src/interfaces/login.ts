import mongoose from 'mongoose';

export interface ILogin extends Document {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  loginTime: number;
}
