import { Document } from 'mongoose';
import { Role } from '../types';

export interface IUser extends Document {
  kakaoId: number;
  name: string;
  thumbnail: string;
  role: Role;
  createdAt: number;
}

