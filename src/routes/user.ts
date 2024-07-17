import express, { Request, Response, NextFunction } from 'express';

import { tokenChecker } from '../middlewares';
import UserModel from '../schemas/User';

const router = express.Router();

router.get('/', tokenChecker, async (req: Request, res: Response, next: NextFunction) => {
  // #swagger.tags = ['Content']
  try {
    const user = req.user;
    const userInfo = await UserModel.findById(user?.sub).exec();

    res.status(200).json(userInfo);
  } catch (error) {
    next(error);
  }
});

export default router;
