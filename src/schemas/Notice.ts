import mongoose, { Schema } from 'mongoose';

import { INotice } from '../interfaces/notice';

const NoticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['update', 'notice'], required: true },
  },
  { timestamps: true },
);

export default mongoose.model<INotice>('Notice', NoticeSchema);
