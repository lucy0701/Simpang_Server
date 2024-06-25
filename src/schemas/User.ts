import mongoose, { Schema } from 'mongoose';

import { IUser } from '../interfaces/user';

const UserSchema = new Schema<IUser>(
  {
    kakaoId: {
      type: Number,
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    thumbnail: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['User', 'Admin', 'Creator'],
      default: 'User',
    },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>('User', UserSchema);
