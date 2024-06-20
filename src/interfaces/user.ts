import { Document } from 'mongoose';

export interface IUser extends Document {
  kakaoId: number;
  name: string;
  thumbnail: string;
  role: 'User' | 'Admin';
  createdAt: number;
}

export type UserInfo = Pick<IUser, 'name' | 'thumbnail' | 'createdAt'>;
