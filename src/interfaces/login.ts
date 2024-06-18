import mongoose from 'mongoose';

export interface ILogin extends Document {
  userId: mongoose.Types.ObjectId;
  loginTime: number;
}
