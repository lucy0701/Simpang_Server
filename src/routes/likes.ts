import express, { NextFunction, Request, Response } from 'express';

import { STATUS_MESSAGES } from '../constants';
import { PaginationOptions } from '../types';

import { loginChecker, tokenChecker, validatePagination } from '../middlewares';
import ContentModel from '../schemas/Content';
import LikeModel from '../schemas/Like';
import { getPaginatedDocuments } from '../utils';

const router = express.Router();

router.get('/', validatePagination, loginChecker, async (req: Request, res: Response, next: NextFunction) => {
  // #swagger.tags = ['like']
  try {
    const user = req.user;
    const { size, page, sort } = req.query as PaginationOptions;

    const {
      totalCount,
      totalPage,
      documents: likeContents,
      pageNum,
    } = await getPaginatedDocuments(LikeModel, { userId: user?.sub }, sort || 'desc', page, size);

    res.status(200).json({
      totalCount,
      totalPage,
      currentPage: pageNum,
      data: likeContents,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/:contentId',
  loginChecker,
  async (req: Request<{ contentId: string }>, res: Response, next: NextFunction) => {
    // #swagger.tags = ['like']
    try {
      const { contentId } = req.params;
      const userId = req.user?.sub;
      const content = await ContentModel.findById(contentId).exec();
      if (!content) return res.status(404).json({ message: STATUS_MESSAGES.NOT_FOUND });

      const like = await LikeModel.findOne({ contentId, userId }).exec();

      let liked = false;

      if (like) {
        await LikeModel.findByIdAndDelete(like._id).exec();
        liked = false;
      } else {
        try {
          await LikeModel.create({
            title: content.title,
            imageUrl: content.imageUrl,
            contentId,
            userId,
          });
          liked = true;
        } catch (error: any) {
          if (error.code === 11000) {
            return res.status(400).json({ message: STATUS_MESSAGES.DUPLICATE_REQUEST });
          }
          next(error);
        }
      }

      const likeCount = await LikeModel.countDocuments({ contentId }).exec();

      content.likeCount = likeCount;
      await content.save();

      res.status(200).json({ likeCount, liked });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/:contentId',
  tokenChecker,
  async (req: Request<{ contentId: string }>, res: Response, next: NextFunction) => {
    // #swagger.tags = ['like']
    try {
      const { contentId } = req.params;
      const userId = req.user?.sub;

      const like = await LikeModel.findOne({ contentId, userId }).exec();
      const likeCount = await LikeModel.countDocuments({ contentId }).exec();

      res.status(200).json({ likeCount, liked: !!like });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
