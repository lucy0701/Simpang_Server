import { IShare } from '../interfaces';
import { createdDate } from '../utils';
import mongoose, { Schema } from 'mongoose';

const ShareSchema = new Schema<IShare>({
  contentId: { type: Schema.Types.ObjectId, required: true, ref: 'Content' },
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
  createdAt: {
    type: Number,
    require: true,
    default: createdDate,
  },
  type: { type: String, required: true, enum: ['Kakao', 'Link'] },
});

export default mongoose.model<IShare>('Share', ShareSchema);
