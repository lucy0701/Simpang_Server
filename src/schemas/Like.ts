import mongoose, { Schema } from 'mongoose';
import { createdDate } from '../utils';
import { IBase } from '../interfaces';

const LikeSchema = new Schema<IBase>({
  contentId: { type: Schema.Types.ObjectId, require: true, ref: 'Content' },
  userId: { type: Schema.Types.ObjectId, require: true, ref: 'User' },
  createdAt: {
    type: Number,
    require: true,
    default: createdDate,
  },
});

export default mongoose.model<IBase>('Like', LikeSchema);
