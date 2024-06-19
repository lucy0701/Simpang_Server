import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { IContent, IResult } from '../interfaces';
import { uploadToImageBB } from '../utils/upload';
import ContentModel from '../schemas/Content';
import ResultModel from '../schemas/Result';

interface QueryParams {
  size: string;
  page: string;
}

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/',
  upload.fields([{ name: 'imageUrls' }]),
  async (req: Request<{}, IContent>, res: Response, next: NextFunction) => {
    try {
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

// TODO : 오름차순, 내림차순 필터
router.get('/', async (req: Request<{}, {}, {}, QueryParams>, res: Response, next: NextFunction) => {
  try {
    const { size, page } = req.query;

    const sizeNum = Number(size);
    const pageNum = Number(page);

    if (!size || !page) {
      return res.status(400).json({ message: 'Page size and page number are required.' });
    } else if (sizeNum < 1 || pageNum < 1) {
      return res.status(400).json({ message: ' Invalid page number or page size. Both must be greater than 0' });
    }

    const totalCount = await ContentModel.countDocuments();
    const totalPage = Math.ceil(totalCount / sizeNum);

    const contents: IContent[] = await ContentModel.find()
      .skip((pageNum - 1) * sizeNum)
      .limit(sizeNum);

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

router.get(':/contentId', async (req: Request<{ contentId: string }>, res: Response, next: NextFunction) => {
  try {
    const { contentId } = req.params;

    const content = await ContentModel.findById(contentId);

    res.status(200).json(content);
  } catch (error) {
    next(error);
  }
});

router.patch(
  ':/contentId',
  async (req: Request<{ contentId: string }, {}, Partial<IContent>>, res: Response, next: NextFunction) => {
    try {
      const { contentId } = req.query;
      const updateData = req.body;
      const updateContent = await ContentModel.findByIdAndUpdate<IContent>(contentId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updateContent) {
        return res.status(404).json({ message: 'Content not found' });
      }

      return res.status(404).json({ updateContent });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(':/contentId', async (req: Request<{ contentId: string }>, res: Response, next: NextFunction) => {
  try {
    const { contentId } = req.query;
    const deleteContent = await ContentModel.findByIdAndDelete(contentId);

    if (!deleteContent) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.status(200).json({ message: 'Content deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
