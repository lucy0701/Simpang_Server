import express, { NextFunction, Request, Response } from 'express';

import { STATUS_MESSAGES } from '../constants';
import { PaginationOptions } from '../types';

import { IComment } from '../interfaces/comment';
import { loginChecker, roleChecker, tokenChecker, validatePagination } from '../middlewares';
import CommentModel from '../schemas/Comment';
import ContentModel from '../schemas/Content';
import { getPaginatedDocuments } from '../utils';

const router = express.Router();

router.post(
  '/:contentId',
  loginChecker,
  async (req: Request<{ contentId: string }, {}, { text: string }>, res: Response, next: NextFunction) => {
    // #swagger.tags = ['Comment']
    try {
      const { contentId } = req.params;
      const { text } = req.body;
      const userId = req.user?.sub;

      if (!text) return res.status(400).json({ message: STATUS_MESSAGES.BAD_REQUEST });

      const content = await ContentModel.findById(contentId).exec();

      if (!content) return res.status(404).json({ message: STATUS_MESSAGES.NOT_FOUND });

      await CommentModel.create({
        contentId,
        userId,
        text,
      });

      const commentCount = await CommentModel.countDocuments({ contentId }).exec();
      content.commentCount = commentCount;
      await content.save();

      res.status(201).json({ message: STATUS_MESSAGES.CREATED });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/:contentId',
  validatePagination,
  tokenChecker,
  async (req: Request<{ contentId: string }, {}, {}, PaginationOptions>, res: Response, next: NextFunction) => {
    // #swagger.tags = ['Comment']
    try {
      const { contentId } = req.params;
      const { size, page, sort } = req.query;
      const {
        totalCount,
        totalPage,
        documents: comments,
        pageNum,
      } = await getPaginatedDocuments(CommentModel, { contentId }, sort || 'desc', page, size);

      res.status(200).json({
        totalCount,
        totalPage,
        currentPage: pageNum,
        comments,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  '/:commentId',
  loginChecker,
  async (req: Request<{ commentId: string }, {}, { text: string }>, res: Response, next: NextFunction) => {
    // #swagger.tags = ['Comment']
    try {
      const { commentId } = req.params;
      const { text } = req.body;

      const updateComment = await CommentModel.findByIdAndUpdate<IComment>(
        commentId,
        { text },
        {
          new: true,
          runValidators: true,
        },
      ).exec();

      if (!updateComment) return res.status(404).json({ message: STATUS_MESSAGES.NOT_FOUND });

      res.status(200).json({ message: STATUS_MESSAGES.UPDATED });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  '/:commentId',
  loginChecker,
  roleChecker(['Creator', 'User', 'Admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    // #swagger.tags = ['Comment']
    try {
      const { commentId } = req.params;
      const user = req.user;

      const comment = await CommentModel.findById(commentId).exec();

      if (!comment) {
        return res.status(404).json({ message: STATUS_MESSAGES.NOT_FOUND });
      }

      if (user?.role === 'Admin' || user?.sub === comment.userId.toString()) {
        const deleteComment = await CommentModel.findByIdAndDelete(commentId).exec();

        if (!deleteComment) return res.status(404).json({ message: STATUS_MESSAGES.NOT_FOUND });

        return res.status(200).json({ message: STATUS_MESSAGES.DELETED });
      } else {
        return res.status(403).json({ message: STATUS_MESSAGES.UNAUTHORIZED });
      }
    } catch (error) {
      next(error);
    }
  },
);

export default router;
