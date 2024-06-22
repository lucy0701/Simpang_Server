import mongoose, { Schema } from 'mongoose';
import { createdDate } from '../utils';
import { IUser } from '../interfaces/user';

const UserSchema = new Schema<IUser>({
  kakaoId: {
    type: Number,
    required: true,
    unique: true,
  },
  name: { type: String, required: true },
  thumbnail: { type: String, required: true },
  createdAt: {
    type: Number,
    required: true,
    default: createdDate,
  },
  role: {
    type: String,
    required: true,
    enum: ['User', 'Admin', 'Creator'],
    default: 'User',
  },
});

export default mongoose.model<IUser>('User', UserSchema);
