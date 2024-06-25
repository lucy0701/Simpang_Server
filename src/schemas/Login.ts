import mongoose, { Schema } from 'mongoose';

import { ILoginRecord } from '../interfaces';

const LoginSchema = new Schema<ILoginRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<ILoginRecord>('Login', LoginSchema);
