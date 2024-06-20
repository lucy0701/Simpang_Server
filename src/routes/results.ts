import express, { NextFunction, Request, Response } from 'express';
import ContentModel from '../schemas/Content';
import ResultModel from '../schemas/Result';
import UserResultModel from '../schemas/UserResult';
import { IContent, IResult, IUserResult } from '../interfaces';

const router = express.Router();

type Score = [number, number, number, number];

interface ReqBody {
  userId?: string;
  score: Score;
}

const calculateResult = (score: Score) => {
  const resultMapping = ['E', 'I', 'N', 'S', 'T', 'F', 'J', 'P'];
  return [
    score[0] > 0 ? resultMapping[0] : resultMapping[1],
    score[1] > 0 ? resultMapping[2] : resultMapping[3],
    score[2] > 0 ? resultMapping[4] : resultMapping[5],
    score[3] > 0 ? resultMapping[6] : resultMapping[7],
  ].join('');
};

router.post(
  '/:contentId',
  async (req: Request<{ contentId: string }, {}, ReqBody>, res: Response, next: NextFunction) => {
    try {
      const { contentId } = req.params;
      // TODO : userId 처리 방법 변경
      const { userId, score } = req.body;

      if (!contentId || !score) {
        return res.status(400).json({ message: 'Missing required fields: score or contentId' });
      }

      if (score.length !== 4 || !score.every((num) => typeof num === 'number')) {
        return res.status(400).json({ message: 'Score must be an array of four numbers' });
      }

      const content = await ContentModel.findById<IContent>(contentId);

      if (!content) {
        return res.status(404).json({ message: 'Content not found' });
      }

      content.playCount = (content.playCount || 0) + 1;
      await content.save();

      const result = calculateResult(score);
      const resultData = await ResultModel.findOne<IResult>({ contentId, result });

      if (!resultData) {
        return res.status(404).json({ message: 'Result not found' });
      }

      // TODO : userId 처리 방법 변경
      if (userId) {
        await UserResultModel.create({
          contentId: content._id,
          resultId: resultData._id,
          userId: userId,
        });
      }

      res.status(200).json(resultData);
    } catch (error) {
      next(error);
    }
  },
);

router.get('/:resultId', async (req: Request<{ resultId: string }>, res: Response, next: NextFunction) => {
  try {
    const { resultId } = req.params;

    const result = await ResultModel.findById<IResult>(resultId);

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
