import mongoose from 'mongoose';

export interface IResult extends Document {
  _id?: string;
  contentId: mongoose.Types.ObjectId;
  result: string;
  title: string;
  content: string;
  imageUrl: string;
}
