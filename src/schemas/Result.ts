import mongoose, { Schema } from 'mongoose';
import { IResult } from '../interfaces';

const ResultSchema = new Schema<IResult>({
  contentId: { type: Schema.Types.ObjectId, required: true, ref: 'Content' },
  result: { type: String, required: true },
  title: { type: String, required: true, minLength: 2, maxLength: 100 },
  content: { type: String, required: true, minLength: 2, maxLength: 500 },
  imageUrl: { type: String, required: true },
});

export default mongoose.model<IResult>('Result', ResultSchema);
