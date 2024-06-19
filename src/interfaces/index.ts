import mongoose, { Document } from 'mongoose';

export * from './content';
export * from './result';
export * from './login';

export interface IBase extends Document {
  contentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: number;
}

export interface IShare extends IBase {
  type: 'Kakao' | 'Link';
}
export interface IUserResult extends IBase {
  resultId: mongoose.Types.ObjectId;
}
