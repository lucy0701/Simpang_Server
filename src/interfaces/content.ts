import { ContentType } from '../types';
import mongoose, { Date, Document } from 'mongoose';

export interface IContent extends Document {
  title: string;
  content: string;
  imageUrl: string;
  questions: {
    index: number;
    question: string;
    answers: {
      score: number;
      text: string;
    }[];
  }[];
  results: mongoose.Types.ObjectId[];
  playCount: number;
  commentCount: number;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
  type: ContentType;
  creator: mongoose.Types.ObjectId;
}
