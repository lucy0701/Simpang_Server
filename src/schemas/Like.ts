import mongoose, { Schema } from 'mongoose';

import { ILikeContents } from '../interfaces';

const LikeSchema = new Schema<ILikeContents>(
  {
    contentId: { type: Schema.Types.ObjectId, require: true, ref: 'Content' },
    userId: { type: Schema.Types.ObjectId, require: true, ref: 'User' },
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

LikeSchema.index({ contentId: 1, userId: 1 }, { unique: true });

export default mongoose.model<ILikeContents>('Like', LikeSchema);
