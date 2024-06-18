import mongoose from 'mongoose';

export * from './content';
export * from './result';

export interface IBase extends Document {
  contentId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  createdAt: number;
}

export interface IShare extends IBase {
  type: 'Kakao' | 'Link';
}
export interface IMemberResult extends IBase {
  menubarId: mongoose.Types.ObjectId;
}

export interface ILoginHistory extends Omit<IBase, 'contentId'> {}
