import mongoose, { Schema } from 'mongoose';
import { createdDate } from '../utils';
import { IUserResult } from '../interfaces';

const UserResultSchema = new Schema<IUserResult>({
  contentId: { type: Schema.Types.ObjectId, required: true, ref: 'Content' },
  resultId: { type: Schema.Types.ObjectId, required: true, ref: 'Result' },
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
  createdAt: {
    type: Number,
    required: true,
    default: createdDate,
  },
});

export default mongoose.model<IUserResult>('UserResult', UserResultSchema);
