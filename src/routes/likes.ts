import express, { NextFunction, Request, Response } from 'express';
import { loginChecker, tokenChecker } from '../middlewares/auth';
import LikeModel from '../schemas/Like';
import ContentModel from '../schemas/Content';

const router = express.Router();

router.post(
  '/:contentId',
  loginChecker,
  async (req: Request<{ contentId: string }>, res: Response, next: NextFunction) => {
    try {
      const { contentId } = req.params;
      const userId = req.user?.sub;
      const content = await ContentModel.findById(contentId).exec();

      if (!content) return res.status(404).json({ message: `Content not found` });

      await LikeModel.create({
        contentId,
        userId,
      });

      const likeCount = await LikeModel.countDocuments({ contentId }).exec();
      content.likeCount = likeCount;
      await content.save();

      res.status(200).json({ likeCount });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/:contentId',
  tokenChecker,
  async (req: Request<{ contentId: string }>, res: Response, next: NextFunction) => {
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
    try {
      const { contentId } = req.params;
      const userId = req.user?.sub;

      const like = await LikeModel.findOne({ contentId, userId }).exec();
      const content = await ContentModel.findById(contentId).exec();

      if (!like) return res.status(404).json({ message: `Like not found` });
      if (!content) return res.status(404).json({ message: `Content not found` });

      await LikeModel.findByIdAndDelete(like._id).exec();

      const likeCount = await LikeModel.countDocuments({ contentId }).exec();
      content.likeCount = likeCount;
      await content.save();

      res.status(200).json({ likeCount, likeState: false });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
