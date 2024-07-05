import express, { NextFunction, Request, Response } from 'express';

import { STATUS_MESSAGES } from '../constants';
import { ShareType } from '../types';

import { tokenChecker } from '../middlewares';
import ContentModel from '../schemas/Content';
import ShareModel from '../schemas/Share';

const router = express.Router();

router.post(
  '/:contentId',
  tokenChecker,
  async (req: Request<{ contentId: string }, {}, {}, { type: ShareType }>, res: Response, next: NextFunction) => {
    // #swagger.tags = ['Share']
    try {
      const { contentId } = req.params;
      const { type } = req.query;
      const user = req.user;

      const content = await ContentModel.findById(contentId).exec();
      if (!content) return res.status(404).json({ message: 'Content not found' });

      if (type === 'Link' || type === 'Kakao') {
        await ShareModel.create({
          contentId,
          userId: user?.sub,
          type,
        });

        return res.status(200).json({ message: STATUS_MESSAGES.SUCCESS });
      } else {
        return res.status(400).json({ message: STATUS_MESSAGES.BAD_REQUEST });
      }
    } catch (error) {
      next(error);
    }
  },
);

export default router;
