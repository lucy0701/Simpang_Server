import express, { NextFunction, Request, Response } from 'express';

import { STATUS_MESSAGES } from '../constants';
import { IContent, IResult } from '../interfaces';
import { PaginationOptions } from '../types';

import { loginChecker, tokenChecker, validatePagination } from '../middlewares';
import ContentModel from '../schemas/Content';
import ResultModel from '../schemas/Result';
import UserResultModel from '../schemas/UserResult';
import { getPaginatedDocuments } from '../utils';

const router = express.Router();

router.post(
  '/:contentId',
  tokenChecker,
  async (req: Request<{ contentId: string }, {}, { result: string }>, res: Response, next: NextFunction) => {
    // #swagger.tags = ['Rusult']
    try {
      const { contentId } = req.params;
      const { result } = req.body;
      const user = req.user;

      if (!contentId || !result) {
        return res.status(400).json({ message: STATUS_MESSAGES.MISSING_FIELD });
      }

      const content = await ContentModel.findById<IContent>(contentId);

      if (!content) {
        return res.status(404).json({ message: STATUS_MESSAGES.NOT_FOUND });
      }

      content.playCount = (content.playCount || 0) + 1;
      await content.save();

      const resultData = await ResultModel.findOne<IResult>({ contentId, result });

      if (!resultData) {
        return res.status(404).json({ message: STATUS_MESSAGES.NOT_FOUND });
      }

      if (user && user.sub) {
        try {
          const findResult = await UserResultModel.find({ userId: user.sub }).countDocuments();

          if (findResult >= 20) {
            const oldestResult = await UserResultModel.findOne({ userId: user.sub }).sort({ createdAt: 1 }).exec();

            if (oldestResult) {
              await UserResultModel.findByIdAndDelete(oldestResult._id).exec();
            }
          }

          await UserResultModel.create({
            contentTitle: content.title,
            contentId: content._id,
            results: resultData._id,
            userId: user.sub,
          });
        } catch (error) {
          return next(error);
        }
      }

      res.status(200).json(resultData._id);
    } catch (error) {
      next(error);
    }
  },
);

router.get('/:resultId', async (req: Request<{ resultId: string }>, res: Response, next: NextFunction) => {
  // #swagger.tags = ['Rusult']
  try {
    const { resultId } = req.params;

    const result = await ResultModel.findById<IResult>(resultId);

    if (!result) {
      return res.status(404).json({ message: STATUS_MESSAGES.NOT_FOUND });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/', loginChecker, validatePagination, async (req: Request, res: Response, next: NextFunction) => {
  // #swagger.tags = ['Rusult']
  try {
    const user = req.user;
    const { size, page, sort } = req.query as PaginationOptions;

    const {
      totalCount,
      totalPage,
      documents: userResults,
      pageNum,
    } = await getPaginatedDocuments(UserResultModel, { userId: user!.sub }, sort || 'desc', page, size);

    const data = await UserResultModel.populate(userResults, { path: 'results' });

    res.status(200).json({
      totalCount,
      totalPage,
      currentPage: pageNum,
      data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
