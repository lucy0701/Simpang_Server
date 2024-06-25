import { Request, Response, NextFunction } from 'express';

import { STATUS_MESSAGES } from '../constants';

export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { size, page, sort } = req.query;

    if (!size || !page || Number(size) < 1 || Number(page) < 1) {
      return res.status(400).json({ message: STATUS_MESSAGES.BAD_REQUEST });
    }

    req.query = { size, page, sort };
    next();
  } catch (error) {
    next(error);
  }
};
