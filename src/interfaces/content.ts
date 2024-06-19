import { ContentType } from '../types';
import mongoose, { Document } from 'mongoose';

export interface IContent extends Document {
  _id?: string;
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
  createdAt: number;
  type: ContentType;
}
