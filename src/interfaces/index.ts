export * from './content';
export * from './result';
export * from './login';
export * from './user';

import { JwtPayload } from 'jsonwebtoken';
import mongoose, { Document } from 'mongoose';
import { Role, ShareType } from '../types';

export interface IBase extends Document {
  contentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: number;
}

export interface IShare extends IBase {
  type: ShareType;
}
export interface IUserResult extends IBase {
  resultId: mongoose.Types.ObjectId;
}

export interface IPayload extends JwtPayload {
  role: Role;
}
