import mongoose, { Schema } from 'mongoose';

import { IUserResult } from '../interfaces';

const UserResultSchema = new Schema<IUserResult>(
  {
    contentTitle: { type: String, required: true },
    contentId: { type: Schema.Types.ObjectId, required: true, ref: 'Content' },
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    results: { type: Schema.Types.ObjectId, required: true, ref: 'Result' },
  },
  { timestamps: true },
);

export default mongoose.model<IUserResult>('UserResult', UserResultSchema);
