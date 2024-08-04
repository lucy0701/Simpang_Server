import express, { Request, Response, NextFunction } from 'express';

import { STATUS_MESSAGES } from '../constants';
import { IContent, IResult } from '../interfaces';
import { PaginationOptions } from '../types';
import { getPaginatedDocuments } from '../utils/pagination';

import { loginChecker, roleChecker, validatePagination } from '../middlewares';
import CommentModel from '../schemas/Comment';
import ContentModel from '../schemas/Content';
import CreateContentModel from '../schemas/CreateContent';
import LikeModel from '../schemas/Like';
import ResultModel from '../schemas/Result';
import UserModel from '../schemas/User';
import UserResultModel from '../schemas/UserResult';

const router = express.Router();

router.post(
  '/',
  loginChecker,
  roleChecker(['Creator', 'Admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    // #swagger.tags = ['Content']
    try {
      const user = req.user;
      const { results, questions, ...contents } = req.body;

      const userData = await UserModel.findById(user!.sub);

      if (req.body.type === 'MBTI_mini') {
        if (questions.length < 5 || results.length !== 6) {
          return res.status(400).json({
            message: STATUS_MESSAGES.BAD_REQUEST,
          });
        }
      } else if (req.body.type === 'MBTI') {
        if (questions.length < 4 || results.length !== 16) {
          return res.status(400).json({
            message: STATUS_MESSAGES.BAD_REQUEST,
          });
        }
      }

      const newContent = await new ContentModel<IContent>({
        questions,
        creator: userData?.name,
        ...contents,
      }).save();

      const newResults = await Promise.all(
        results.map(async (resultData: IResult) => {
          const newResult = new ResultModel({
            ...resultData,
            contentId: newContent._id,
          });
          return await newResult.save();
        }),
      );

      await new CreateContentModel({
        contentId: newContent._id,
        userId: user?.sub,
      }).save();

      newContent.results = newResults.map((results) => results._id);

      await newContent.save();

      res.status(201).json({ message: STATUS_MESSAGES.CREATED });
    } catch (error) {
      next(error);
    }
  },
);

router.get('/', validatePagination, async (req: Request, res: Response, next: NextFunction) => {
  // #swagger.tags = ['Content']
  try {
    const { size, page, sort } = req.query as PaginationOptions;
    const {
      totalCount,
      totalPage,
      documents: contents,
      pageNum,
    } = await getPaginatedDocuments(ContentModel, {}, sort || 'desc', page, size);

    const filteredContent: Partial<IContent>[] = contents.map((content) => {
      const { questions, results, updatedAt, ...filteredContent } = content.toObject();
      return filteredContent;
    });

    res.status(200).json({
      totalCount,
      totalPage,
      currentPage: pageNum,
      data: filteredContent,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/random', async (req: Request<{}, {}, {}, { size: string }>, res: Response, next: NextFunction) => {
  // #swagger.tags = ['Content']

  try {
    const size = Number(req.query.size);

    if (isNaN(size)) {
      return res.status(400).json({ message: 'Invalid size parameter' });
    }

    const randomContent: IContent[] = await ContentModel.aggregate([{ $sample: { size } }]);

    if (!randomContent || randomContent.length === 0) {
      return res.status(404).json({ message: 'Results not found' });
    }

    res.status(200).json(randomContent);
  } catch (error) {
    next(error);
  }
});

router.get('/:contentId', async (req: Request<{ contentId: string }>, res: Response, next: NextFunction) => {
  // #swagger.tags = ['Content']
  try {
    const { contentId } = req.params;
    const content = await ContentModel.findById(contentId).exec();

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.status(200).json(content);
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/:contentId',
  loginChecker,
  roleChecker(['Creator', 'Admin']),
  async (req: Request<{ contentId: string }>, res: Response, next: NextFunction) => {
    // #swagger.tags = ['Content']
    try {
      const { contentId } = req.params;
      const { results, ...contentData } = req.body;
      const user = req.user;

      if (user?.role === 'Creator') {
        const creator = await ContentModel.findOne({ creator: user?.sub, _id: contentId }).exec();
        if (!creator) return res.status(403).json({ message: STATUS_MESSAGES.UNAUTHORIZED });
      }

      await Promise.all(
        results.map(async (updateData: IResult) => {
          const updatedResult = await ResultModel.findOneAndUpdate({ result: updateData.result }, updateData, {
            new: true,
            upsert: true,
            runValidators: true,
          }).exec();
          return updatedResult;
        }),
      );

      const updateContent = await ContentModel.findByIdAndUpdate<IContent>(contentId, contentData, {
        new: true,
        runValidators: true,
      }).exec();

      if (!updateContent) {
        return res.status(404).json({ message: STATUS_MESSAGES.NOT_FOUND });
      }

      res.status(200).json({ message: STATUS_MESSAGES.UPDATED });
    } catch (error) {
      next(error);
    }
  },
);

// TODO : 실제 데이터 삭제 말고, 공개 여부로 변경 하기
router.delete(
  '/:contentId',
  loginChecker,
  roleChecker(['Creator', 'Admin']),
  async (req: Request<{ contentId: string }>, res: Response, next: NextFunction) => {
    // #swagger.tags = ['Content']
    try {
      const { contentId } = req.params;
      const user = req.user;

      if (user?.role === 'Creator') {
        const creator = await ContentModel.findOne({ creator: user?.sub, _id: contentId }).exec();
        if (!creator) {
          return res.status(403).json({ message: STATUS_MESSAGES.UNAUTHORIZED });
        }
      }
      await Promise.all([
        UserResultModel.deleteMany({ contentId }),
        LikeModel.deleteMany({ contentId }),
        ResultModel.deleteMany({ contentId }),
        CommentModel.deleteMany({ contentId }),
        CreateContentModel.deleteMany({ contentId }),
      ]);

      const deleteContent = await ContentModel.findByIdAndDelete(contentId).exec();

      if (!deleteContent) {
        return res.status(404).json({ message: STATUS_MESSAGES.NOT_FOUND });
      }

      res.status(200).json({ message: STATUS_MESSAGES.DELETED });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
