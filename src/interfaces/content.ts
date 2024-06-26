import mongoose, { Date, Document } from 'mongoose';

import { ContentType } from '../types';

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
  type: ContentType;
  creator: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
