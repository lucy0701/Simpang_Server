import { Request, Response, NextFunction } from 'express';

import { STATUS_MESSAGES } from '../constants';

export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { size, page, sort, filter } = req.query;

    if (!size || !page || Number(size) < 1 || Number(page) < 1) {
      return res.status(400).json({ message: STATUS_MESSAGES.BAD_REQUEST });
    }

    req.query = { size, page, sort, filter };
    next();
  } catch (error) {
    next(error);
  }
};
