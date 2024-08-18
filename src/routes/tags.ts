import express, { NextFunction, Request, Response } from 'express';

import { STATUS_MESSAGES } from '../constants';

import { loginChecker, roleChecker } from '../middlewares';
import ContentModel from '../schemas/Content';
import TagModel from '../schemas/Tag';

const router = express.Router();

router.post(
  '/',
  loginChecker,
  roleChecker(['Creator', 'Admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;

      await TagModel.create({
        name,
      });

      res.status(201).json({ message: STATUS_MESSAGES.CREATED });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/',
  loginChecker,
  roleChecker(['Creator', 'Admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter = req.query.filter as string;

      const tags = await TagModel.find(filter ? { name: { $regex: new RegExp(filter, 'i') } } : {});

      res.json(tags);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  '/:tagId',
  loginChecker,
  roleChecker(['Creator', 'Admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tagId } = req.params;
      const { name } = req.body;
      console.log('PSJ: name', name);

      const updateTag = await TagModel.findByIdAndUpdate(tagId, { name: name }, { new: true }).exec();

      if (!updateTag) {
        return res.status(404).json({ message: STATUS_MESSAGES.NOT_FOUND });
      }

      res.status(200).json({ message: STATUS_MESSAGES.UPDATED });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  '/:tagId',
  loginChecker,
  roleChecker(['Creator', 'Admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tagId } = req.params;
      const deleteTag = await TagModel.findByIdAndDelete(tagId).exec();

      if (!deleteTag) {
        return res.status(404).json({ message: STATUS_MESSAGES.NOT_FOUND });
      }

      await ContentModel.updateMany({ tags: tagId }, { $pull: { tags: tagId } }).exec();

      res.status(200).json({ message: STATUS_MESSAGES.DELETED });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
