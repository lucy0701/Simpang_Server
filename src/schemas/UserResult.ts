import mongoose, { Schema } from 'mongoose';
import { IUserResult } from '../interfaces';

const UserResultSchema = new Schema<IUserResult>(
  {
    contentId: { type: Schema.Types.ObjectId, required: true, ref: 'Content' },
    resultId: { type: Schema.Types.ObjectId, required: true, ref: 'Result' },
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
  },
  { timestamps: true },
);

export default mongoose.model<IUserResult>('UserResult', UserResultSchema);
