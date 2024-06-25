import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';

import { STATUS_MESSAGES } from '../constants';
import { IContent, IResult } from '../interfaces';
import { PaginationOptions } from '../types';
import { getPaginatedDocuments } from '../utils/pagination';

import { loginChecker, roleChecker, validatePagination } from '../middlewares';
import CommentModel from '../schemas/Comment';
import ContentModel from '../schemas/Content';
import LikeModel from '../schemas/Like';
import ResultModel from '../schemas/Result';
import ShareModel from '../schemas/Share';
import UserResultModel from '../schemas/UserResult';
import { uploadToImageBB } from '../services';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/',
  loginChecker,
  roleChecker(['Creator', 'Admin']),
  upload.fields([{ name: 'imageUrls' }]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (req.body.type === 'MBTI') {
        if (req.body.questions.length !== 12 || req.body.results.length) {
          return res.status(400).json({
            message: STATUS_MESSAGES.BAD_REQUEST,
          });
        }
      }

      const { questions, results, ...contentData } = req.body;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const images = files?.['imageUrls'] || [];

      const imageUrls = await Promise.all(images.map((file) => uploadToImageBB(file)));

      const newContent = await new ContentModel<IContent>({
        imageUrl: imageUrls[0],
        questions: JSON.parse(questions),
        creator: user?._id,
        ...contentData,
      }).save();

      const newResults = await Promise.all(
        JSON.parse(results).map(async (resultData: IResult, i: number) => {
          const newResult = new ResultModel({
            ...resultData,
            contentId: newContent._id,
            imageUrl: imageUrls[i + 1],
          });
          return await newResult.save();
        }),
      );

      newContent.results = newResults.map((results) => results._id);

      await newContent.save();

      res.status(201).json({ message: STATUS_MESSAGES.CREATED });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/',
  validatePagination,
  async (req: Request<{}, {}, {}, PaginationOptions>, res: Response, next: NextFunction) => {
    try {
      const { size, page, sort } = req.query;
      const {
        totalCount,
        totalPage,
        documents: contents,
        pageNum,
      } = await getPaginatedDocuments(ContentModel, {}, sort || 'desc', page, size);

      const filteredContent: Partial<IContent>[] = contents.map((content) => {
        const { questions, results, ...filteredContent } = content.toObject();
        return filteredContent;
      });

      res.status(200).json({
        totalCount,
        totalPage,
        currentPage: pageNum,
        contents: filteredContent,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get('/random', async (_, res: Response, next: NextFunction) => {
  try {
    const randomContent = await ContentModel.aggregate([{ $sample: { size: 1 } }]);

    if (!randomContent || randomContent.length === 0) {
      return res.status(404).json({ message: 'Results not found' });
    }

    res.status(200).json(randomContent);
  } catch (error) {
    next(error);
  }
});

router.get('/:contentId', async (req: Request<{ contentId: string }>, res: Response, next: NextFunction) => {
  try {
    const { contentId } = req.params;

    const content = await ContentModel.findById(contentId).exec();

    res.status(200).json(content);
  } catch (error) {
    next(error);
  }
});

// TODO: Result, imageUrl upload 추가
router.patch(
  '/:contentId',
  loginChecker,
  roleChecker(['Creator', 'Admin']),
  async (req: Request<{ contentId: string }>, res: Response, next: NextFunction) => {
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

router.delete(
  '/:contentId',
  loginChecker,
  roleChecker(['Creator', 'Admin']),
  async (req: Request<{ contentId: string }>, res: Response, next: NextFunction) => {
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
        ShareModel.deleteMany({ contentId }),
        LikeModel.deleteMany({ contentId }),
        ResultModel.deleteMany({ contentId }),
        CommentModel.deleteMany({ contentId }),
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
