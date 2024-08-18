import mongoose, { Schema } from 'mongoose';

import { ITag } from '../interfaces';

const TagSchema = new Schema<ITag>({
  name: { type: String, required: true },
});

export default mongoose.model<ITag>('Tag', TagSchema);
