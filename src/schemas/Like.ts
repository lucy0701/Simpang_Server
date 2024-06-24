import mongoose, { Schema } from 'mongoose';
import { IBase } from '../interfaces';

const LikeSchema = new Schema<IBase>(
  {
    contentId: { type: Schema.Types.ObjectId, require: true, ref: 'Content' },
    userId: { type: Schema.Types.ObjectId, require: true, ref: 'User' },
  },
  { timestamps: true },
);

LikeSchema.index({ contentId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IBase>('Like', LikeSchema);
