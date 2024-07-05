import mongoose, { Date, Document } from 'mongoose';

export interface IComment extends Document {
  contentId: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}
