import { Response, Request, NextFunction } from 'express';
import mongoose from 'mongoose';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: 'Validation Error', details: err.errors });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: 'Invalid ID format', details: err.message });
  }

  console.error('Internal Server Error: ', err);
  res.status(500).json({ message: 'Internal Server Error' });
};
