import express, { NextFunction, Request, Response } from 'express';

import { STATUS_MESSAGES } from '../constants';

import { loginChecker, tokenChecker } from '../middlewares';
import ContentModel from '../schemas/Content';
import LikeModel from '../schemas/Like';

const router = express.Router();

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

      try {
        await LikeModel.create({
          contentId,
          userId,
        });
      } catch (error: any) {
        if (error.code === 11000) {
          return res.status(400).json({ message: STATUS_MESSAGES.DUPLICATE_REQUEST });
        }
        next(error);
      }

      const likeCount = await LikeModel.countDocuments({ contentId }).exec();
      content.likeCount = likeCount;
      await content.save();

      res.status(200).json({ likeCount, liked: true });
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

      if (!userId) return res.status(200).json({ liked: false });

      const like = await LikeModel.findOne({ contentId, userId }).exec();

      res.status(200).json({ liked: !!like });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  '/:contentId',
  loginChecker,
  async (req: Request<{ contentId: string }>, res: Response, next: NextFunction) => {
    // #swagger.tags = ['like']
    try {
      const { contentId } = req.params;
      const userId = req.user?.sub;

      const like = await LikeModel.findOne({ contentId, userId }).exec();
      const content = await ContentModel.findById(contentId).exec();

      if (!like) return res.status(404).json({ message: STATUS_MESSAGES.NOT_FOUND });
      if (!content) return res.status(404).json({ message: STATUS_MESSAGES.NOT_FOUND });

      await LikeModel.findByIdAndDelete(like._id).exec();

      const likeCount = await LikeModel.countDocuments({ contentId }).exec();
      content.likeCount = likeCount;
      await content.save();

      res.status(200).json({ likeCount, liked: false });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
