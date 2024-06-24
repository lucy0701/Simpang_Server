import express, { NextFunction, Request, Response } from 'express';
import { tokenChecker } from '../middlewares/auth';
import { ShareType } from '../types';
import ContentModel from '../schemas/Content';
import ShareModel from '../schemas/Share';

const router = express.Router();

router.post(
  '/:contentId',
  tokenChecker,
  async (req: Request<{ contentId: string }, {}, {}, { type: ShareType }>, res: Response, next: NextFunction) => {
    try {
      const { contentId } = req.params;
      const { type } = req.query;
      const user = req.user;

      const content = await ContentModel.findById(contentId).exec();
      if (!content) return res.status(404).json({ message: 'Content not found' });

      if (type === 'Link' || (type === 'Kakao' && user)) {
        await ShareModel.create({
          contentId,
          userId: user?.sub,
          type,
        });

        return res.status(200).json({ message: 'Content Share successfully' });
      } else if (type === 'Kakao' && !user) {
        return res.status(401).json({ message: 'User not found' });
      } else {
        return res.status(400).json({ message: 'Invalid share type' });
      }
    } catch (error) {
      next(error);
    }
  },
);

export default router;
