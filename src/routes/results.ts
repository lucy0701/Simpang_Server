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

type Score = [number, number, number, number];

const calculateResult = (score: Score) => {
  const resultMapping = ['E', 'I', 'N', 'S', 'T', 'F', 'J', 'P'];
  return [
    score[0] > 0 ? resultMapping[0] : resultMapping[1],
    score[1] > 0 ? resultMapping[2] : resultMapping[3],
    score[2] > 0 ? resultMapping[4] : resultMapping[5],
    score[3] > 0 ? resultMapping[6] : resultMapping[7],
  ].join('');
};

router.post(
  '/:contentId',
  tokenChecker,
  async (req: Request<{ contentId: string }, {}, { score: Score }>, res: Response, next: NextFunction) => {
    // #swagger.tags = ['Rusult']
    try {
      const { contentId } = req.params;
      const { score } = req.body;
      const user = req.user;

      if (!contentId || !score) {
        return res.status(400).json({ message: STATUS_MESSAGES.MISSING_FIELD });
      }

      if (score.length !== 4 || !score.every((num) => typeof num === 'number')) {
        return res.status(400).json({ message: STATUS_MESSAGES.BAD_REQUEST });
      }

      const content = await ContentModel.findById<IContent>(contentId);

      if (!content) {
        return res.status(404).json({ message: STATUS_MESSAGES.NOT_FOUND });
      }

      content.playCount = (content.playCount || 0) + 1;
      await content.save();

      const result = calculateResult(score);
      const resultData = await ResultModel.findOne<IResult>({ contentId, result });

      if (!resultData) {
        return res.status(404).json({ message: STATUS_MESSAGES.NOT_FOUND });
      }

      if (user) {
        const findResult = await ResultModel.find({ userId: user.sub }).countDocuments();
        if (findResult >= 50) {
          const oldestResult = await ResultModel.findOne({ userId: user.sub }).sort({ createdAt: 1 }).exec();

          if (oldestResult) {
            await ResultModel.findByIdAndDelete(oldestResult._id).exec();
          }
        }
        await UserResultModel.create({
          contentId: content._id,
          resultId: resultData._id,
          userId: user._id,
        });
      }

      res.status(200).json(resultData);
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

router.get(
  '/:contentId',
  loginChecker,
  validatePagination,
  async (req: Request<{ contentId: string }, {}, {}, PaginationOptions>, res: Response, next: NextFunction) => {
    // #swagger.tags = ['Rusult']
    try {
      const { contentId } = req.params;
      const user = req.user;
      const { size, page, sort } = req.query;

      const {
        totalCount,
        totalPage,
        documents: results,
        pageNum,
      } = await getPaginatedDocuments(ResultModel, { contentId, userId: user!._id }, sort || 'desc', page, size);

      res.status(200).json({
        totalCount,
        totalPage,
        currentPage: pageNum,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
