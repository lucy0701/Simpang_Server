export * from './content';
export * from './result';
export * from './user';

import { JwtPayload } from 'jsonwebtoken';
import mongoose, { Document, Date } from 'mongoose';

import { Role } from '../types';

export interface IBase extends Document {
  contentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ILikeContents extends IBase {
  title: string;
  imageUrl: string;
}

export interface IUserResult extends IBase {
  contentTitle: string;
  results: mongoose.Types.ObjectId;
}

export interface IPayload extends JwtPayload {
  role: Role;
  accessToken: string;
}
