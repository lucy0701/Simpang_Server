import express, { NextFunction, Request, Response } from 'express';
import { loginChecker, roleChecker, tokenChecker } from '../middlewares/auth';
import { PaginationOptions } from '../interfaces';
import ContentModel from '../schemas/Content';
import CommentModel from '../schemas/Comment';
import { IComment } from '../interfaces/comment';

const router = express.Router();

router.post(
  '/:contentId',
  loginChecker,
  async (req: Request<{ contentId: string }, {}, { text: string }>, res: Response, next: NextFunction) => {
    try {
      const { contentId } = req.params;
      const { text } = req.body;
      const userId = req.user?.sub;

      if (!text) return res.status(400).json({ message: 'text is required' });

      const content = await ContentModel.findById(contentId).exec();

      if (!content) return res.status(404).json({ message: 'Content not found' });

      const newComment = await CommentModel.create({
        contentId,
        userId,
        text,
      });

      const commentCount = await CommentModel.countDocuments({ contentId }).exec();
      content.commentCount = commentCount;
      await content.save();

      res.status(201).json({ newComment, commentCount });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/:contentId',
  tokenChecker,
  async (
    req: Request<{ contentId: string }, {}, {}, Partial<PaginationOptions>>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { contentId } = req.params;
      const { size, page, sort } = req.query;

      if (!size || !page) {
        return res.status(400).json({ message: 'Page size and page number are required.' });
      }
      const sizeNum = Number(size);
      const pageNum = Number(page);

      if (sizeNum < 1 || pageNum < 1) {
        return res.status(400).json({ message: ' Invalid page number or page size. Both must be greater than 0' });
      }

      const totalCount = await CommentModel.countDocuments({ contentId }).exec();
      const totalPage = Math.ceil(totalCount / sizeNum);
      const commentSort = CommentModel.find({ contentId });

      if (sort === 'asc') commentSort.sort({ createdAt: 1 });
      else commentSort.sort({ createdAt: -1 });

      const comments: IComment[] = await commentSort
        .skip((pageNum - 1) * sizeNum)
        .limit(sizeNum)
        .exec();

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

      if (!updateComment) return res.status(404).json({ message: 'Comment not found' });

      res.status(200).json({ updateComment });
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
    try {
      const { commentId } = req.params;
      const user = req.user;

      const comment = await CommentModel.findById(commentId).exec();

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      if (user?.role === 'Admin' || user?.sub === comment.userId.toString()) {
        const deleteComment = await CommentModel.findByIdAndDelete(commentId).exec();

        if (!deleteComment) return res.status(404).json({ message: 'Comment not found' });

        return res.status(200).json({ message: 'Comment deleted successfully' });
      } else {
        return res.status(403).json({ message: '접근 권한이 없습니다.' });
      }
    } catch (error) {
      next(error);
    }
  },
);

export default router;