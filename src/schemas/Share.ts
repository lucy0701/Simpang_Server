import { IShare } from '../interfaces';
import mongoose, { Schema } from 'mongoose';

const ShareSchema = new Schema<IShare>(
  {
    contentId: { type: Schema.Types.ObjectId, required: true, ref: 'Content' },
    userId: { type: Schema.Types.ObjectId, ref: 'Member' },
    type: { type: String, required: true, enum: ['Kakao', 'Link'] },
  },
  { timestamps: true },
);

export default mongoose.model<IShare>('Share', ShareSchema);
