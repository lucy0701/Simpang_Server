import mongoose, { Schema } from 'mongoose';
import { createdDate } from '../utils';
import { ILogin } from '../interfaces';

const LoginSchema = new Schema<ILogin>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  loginTime: {
    type: Number,
    required: true,
    default: createdDate,
  },
});

export default mongoose.model<ILogin>('Login', LoginSchema);
