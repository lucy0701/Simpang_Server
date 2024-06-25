import { Request, Response, NextFunction } from 'express';

export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { size, page, sort } = req.query;
    if (!size || !page) {
      return res.status(400).json({ message: 'Page size and page number are required.' });
    }

    if (Number(size) < 1 || Number(page) < 1) {
      return res.status(400).json({ message: 'Invalid page number or page size. Both must be greater than 0' });
    }

    req.query = { size, page, sort };
    next();
  } catch (error) {
    next(error);
  }
};
