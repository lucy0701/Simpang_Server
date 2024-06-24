import mongoose, { Schema } from 'mongoose';
import { IComment } from '../interfaces/comment';

const CommentSchema = new Schema<IComment>(
  {
    contentId: { type: Schema.Types.ObjectId, required: true, ref: 'Content' },
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    content: { type: String, minLength: 1, maxLength: 100, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<IComment>('Comment', CommentSchema);
