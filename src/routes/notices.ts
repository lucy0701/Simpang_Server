import express, { NextFunction, Request, Response } from 'express';

import { STATUS_MESSAGES } from '../constants';
import { PaginationOptions } from '../types';

import { INotice } from '../interfaces/notice';
import { loginChecker, roleChecker, validatePagination } from '../middlewares';
import NoticeModel from '../schemas/Notice';
import { getPaginatedDocuments } from '../utils';

const router = express.Router();

router.post('/', loginChecker, async (req: Request, res: Response, next: NextFunction) => {
  // #swagger.tags = ['Notice']
  try {
    const { title, content, type } = req.body;

    await NoticeModel.create({
      title,
      content,
      type,
    });

    res.status(201).json({ message: STATUS_MESSAGES.CREATED });
  } catch (error) {
    next(error);
  }
});

router.get('/', validatePagination, async (req: Request, res: Response, next: NextFunction) => {
  // #swagger.tags = ['Notice']
  try {
    const { size, page, sort, filter } = req.query as PaginationOptions;

    const {
      totalCount,
      totalPage,
      documents: notices,
      pageNum,
    } = await getPaginatedDocuments(NoticeModel, filter ? filter : {}, sort || 'desc', page, size);

    const filteredNotices: Partial<INotice>[] = notices.map((notice) => {
      const { content, ...filteredNotice } = notice.toObject();
      return filteredNotice;
    });

    res.status(200).json({
      totalCount,
      totalPage,
      currentPage: pageNum,
      data: filteredNotices,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:noticeId', async (req: Request, res: Response, next: NextFunction) => {
  // #swagger.tags = ['Notice']
  try {
    const { noticeId } = req.params;
    const notice = await NoticeModel.findById(noticeId).exec();

    if (!notice) return res.status(404).json({ message: STATUS_MESSAGES.NOT_FOUND });

    res.status(200).json(notice);
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/:noticeId',
  loginChecker,
  roleChecker(['Admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    // #swagger.tags = ['Notice']
    try {
      const { noticeId } = req.params;
      const { noticeData } = req.body;

      const updateNotice = await NoticeModel.findByIdAndUpdate<INotice>(noticeId, noticeData, {
        new: true,
        runValidators: true,
      }).exec();

      if (!updateNotice) return res.status(404).json({ message: STATUS_MESSAGES.NOT_FOUND });

      res.status(200).json({ message: STATUS_MESSAGES.SUCCESS });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  '/:noticeId',
  loginChecker,
  roleChecker(['Admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    // #swagger.tags = ['Notice']
    try {
      const { noticeId } = req.params;
      const deleteNotice = await NoticeModel.findByIdAndDelete(noticeId).exec();
      if (!deleteNotice) return res.status(404).json({ message: STATUS_MESSAGES.NOT_FOUND });

      res.status(200).json({ message: STATUS_MESSAGES.SUCCESS });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
