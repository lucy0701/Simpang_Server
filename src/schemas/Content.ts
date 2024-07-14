import mongoose, { Schema } from 'mongoose';

import { IContent } from '../interfaces';

const ContentSchema = new Schema<IContent>(
  {
    title: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    content: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 500,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    questions: [
      {
        index: {
          type: Number,
          required: true,
        },
        question: { type: String, required: true, minLength: 2, maxLength: 200 },
        answers: [
          {
            score: {
              type: Number,
              required: true,
            },
            text: {
              type: String,
              required: true,
              minLength: 2,
              maxLength: 100,
            },
            _id: false,
          },
        ],
        _id: false,
      },
    ],
    results: [{ type: Schema.Types.ObjectId, ref: 'Result' }],
    playCount: { type: Number, required: true, default: 0 },
    commentCount: { type: Number, required: true, default: 0 },
    likeCount: { type: Number, required: true, default: 0 },
    type: { type: String, required: true, enum: ['MBTI'] },
    creator: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export default mongoose.model<IContent>('Content', ContentSchema);
