import { Document } from 'mongoose';

export interface INotice extends Document {
  title: string;
  content: string;
  type: 'update' | 'notice';
  createdAt: Date;
  updatedAt: Date;
}
