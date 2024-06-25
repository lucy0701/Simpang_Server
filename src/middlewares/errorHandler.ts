import axios from 'axios';
import { Response, Request, NextFunction } from 'express';
import mongoose from 'mongoose';

import { STATUS_MESSAGES } from '../constants';

export const errorHandler = (err: any, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  if (axios.isAxiosError(err)) {
    return res.status(500).json({ message: STATUS_MESSAGES.EXTERNAL_API_ERROR, details: err.message });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: STATUS_MESSAGES.VALIDATION_ERROR, details: err.errors });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: STATUS_MESSAGES.INVALID_ID_FORMAT, details: err.message });
  }

  console.error(STATUS_MESSAGES.EXTERNAL_API_ERROR, err);
  res.status(500).json({ message: STATUS_MESSAGES.SERVER_ERROR });
};
