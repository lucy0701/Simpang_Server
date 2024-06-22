import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { IContent, IResult } from '../interfaces';
import { uploadToImageBB } from '../services';
import ContentModel from '../schemas/Content';
import ResultModel from '../schemas/Result';
import { loginChecker, roleChecker } from '../middlewares/auth';

interface QueryParams {
  size: string;
  page: string;
  sort?: 'asc' | 'desc';
}

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/',
  loginChecker,
  roleChecker(['Creator', 'Admin']),
  upload.fields([{ name: 'imageUrls' }]),
  async (req: Request<{}, IContent>, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (req.body.type === 'MBTI') {
        if (req.body.questuions.length !== 12 || req.body.results.length) {
          return res.status(400).json({
            message: 'For MBTI type, there must be exacthly 12 questions and 16 results.',
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

      res.status(201).json(newContent);
    } catch (error) {
      next(error);
    }
  },
);

router.get('/', async (req: Request<{}, {}, {}, QueryParams>, res: Response, next: NextFunction) => {
  try {
    const { size, page, sort } = req.query;

    const sizeNum = Number(size);
    const pageNum = Number(page);

    if (!size || !page) {
      return res.status(400).json({ message: 'Page size and page number are required.' });
    } else if (sizeNum < 1 || pageNum < 1) {
      return res.status(400).json({ message: ' Invalid page number or page size. Both must be greater than 0' });
    }

    const totalCount = await ContentModel.countDocuments();
    const totalPage = Math.ceil(totalCount / sizeNum);
    const contentSort = ContentModel.find();

    if (sort === 'asc') contentSort.sort({ createdAt: 1 });
    else contentSort.sort({ createAt: -1 });

    const contents: IContent[] = await contentSort
      .skip((pageNum - 1) * sizeNum)
      .limit(sizeNum)
      .exec();

    const filteredContent: Partial<IContent>[] = contents.map((content) => {
      const { questions, results, __v, ...filteredContent } = content.toObject();
      return filteredContent;
    });

    res.status(200).json({
      totalPage,
      currentPage: pageNum,
      contents: filteredContent,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/random', async (_, res: Response, next: NextFunction) => {
  try {
    const randomContent = await ContentModel.aggregate([{ $sample: { size: 1 } }]);

    if (!randomContent || randomContent.length === 0) {
      return res.status(404).json({ message: 'No results found' });
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

router.patch(
  '/:contentId',
  loginChecker,
  roleChecker(['Creator', 'Admin']),
  async (req: Request<{ contentId: string }, {}, Partial<IContent>>, res: Response, next: NextFunction) => {
    try {
      const { contentId } = req.query;
      const updateData = req.body;
      const user = req.user;

      if (user?.role === 'Creator') {
        const creator = await ContentModel.findOne({ creator: user?.sub });
        if (!creator) return res.status(403).json({ message: '접근 권한이 없습니다.' });
      }

      const updateContent = await ContentModel.findByIdAndUpdate<IContent>(contentId, updateData, {
        new: true,
        runValidators: true,
      }).exec();

      if (!updateContent) {
        return res.status(404).json({ message: 'Content not found' });
      }

      return res.status(404).json({ updateContent });
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
      const { contentId } = req.query;
      const user = req.user;

      if (user?.role === 'Creator') {
        const creator = await ContentModel.findOne({ creator: user?.sub });
        if (!creator) return res.status(403).json({ message: '접근 권한이 없습니다.' });
      }

      const deleteContent = await ContentModel.findByIdAndDelete(contentId);

      if (!deleteContent) {
        return res.status(404).json({ message: 'Content not found' });
      }

      res.status(200).json({ message: 'Content deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
