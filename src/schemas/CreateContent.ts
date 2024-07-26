import mongoose, { Schema } from 'mongoose';

import { IBase } from '../interfaces';

const CreateContentSchema = new Schema<IBase>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      ref: 'Content',
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IBase>('CreateContent', CreateContentSchema);
