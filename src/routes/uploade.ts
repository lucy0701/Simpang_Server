import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';

import { STATUS_MESSAGES } from '../constants';

import { loginChecker, roleChecker } from '../middlewares';
import { uploadToImageBB } from '../services';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/',
  loginChecker,
  roleChecker(['Creator', 'Admin']),
  upload.single('imageUrl'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: STATUS_MESSAGES.BAD_REQUEST });
      }
      const imageUrl = await uploadToImageBB(file);

      res.status(200).json(imageUrl);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
