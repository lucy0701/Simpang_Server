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
  tags: mongoose.Types.ObjectId[];
  creator: string;
  createdAt: Date;
  updatedAt: Date;
}
