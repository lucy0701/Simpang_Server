export * from './content';
export * from './result';
export * from './user';

import { JwtPayload } from 'jsonwebtoken';
import mongoose, { Document, Date } from 'mongoose';

import { Role, ShareType } from '../types';

export interface IBase extends Document {
  contentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IShare extends Omit<IBase, 'userId'> {
  userId?: mongoose.Types.ObjectId;
  type: ShareType;
}

export interface IUserResult extends IBase {
  resultId: mongoose.Types.ObjectId;
}

export interface IPayload extends JwtPayload {
  role: Role;
  accessToken: string;
}

export interface ILoginRecord extends Document {
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}
