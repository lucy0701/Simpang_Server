import mongoose, { Schema } from 'mongoose';

import { IShare } from '../interfaces';

const ShareSchema = new Schema<IShare>(
  {
    contentId: { type: Schema.Types.ObjectId, required: true, ref: 'Content' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, required: true, enum: ['Kakao', 'Link'] },
  },
  { timestamps: true },
);

export default mongoose.model<IShare>('Share', ShareSchema);
