import axios from 'axios';
import express, { Request, Response, NextFunction } from 'express';

import { REST_API_KEY, STATUS_MESSAGES } from '../constants';
import { IUser } from '../interfaces';
import { AuthToken, UserInfoResponse } from '../types';
import JwtService from '../utils/jwtService';

import { loginChecker } from '../middlewares';
import CommentModel from '../schemas/Comment';
import LikeModel from '../schemas/Like';
import UserModel from '../schemas/User';
import UserResultModel from '../schemas/UserResult';

const router = express.Router();

router.get(
  '/login',
  async (req: Request<{}, {}, {}, { code: string; url: string }>, res: Response, next: NextFunction) => {
    // #swagger.tags = ['Kakao OAuth']
    try {
      const code = req.query.code;
      const url = req.query.url;

      if (!code) {
        return res.status(400).json({ message: STATUS_MESSAGES.PROVIDE_ACCESS_TOKEN });
      }

      const authToken = await axios.post<AuthToken>(
        'https://kauth.kakao.com/oauth/token',
        {},
        {
          headers: { 'Content-type': 'application/x-www-form-urlencoded' },
          params: {
            grant_type: 'authorization_code',
            client_id: REST_API_KEY,
            redirect_uri: url,
            code,
          },
        },
      );

      const accessToken = authToken.data.access_token;

      const userInfoResponse = await axios.post<UserInfoResponse>(
        'https://kapi.kakao.com/v2/user/me',
        {},
        {
          headers: {
            'Content-type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const userInfoData = userInfoResponse.data;

      let user = await UserModel.findOne<IUser>({ kakaoId: userInfoData.id });

      if (user) {
        user.name = userInfoData.kakao_account.profile.nickname;
        user.thumbnail = userInfoData.kakao_account.profile.thumbnail_image_url;
        await user.save();
      } else {
        user = await UserModel.create({
          kakaoId: userInfoData.id,
          name: userInfoData.kakao_account.profile.nickname,
          thumbnail: userInfoData.kakao_account.profile.thumbnail_image_url,
        });
      }

      const token = JwtService.createJWT(user, accessToken);

      res.setHeader('Authorization', `Bearer ${token}`);
      res.status(200).json({ message: 'Login successful' });
    } catch (error) {
      console.error('Error during Kakao OAuth process:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error response data:', error.response?.data);
      }
      next(error);
    }
  },
);

router.get('/logout', loginChecker, async (req: Request, res: Response, next: NextFunction) => {
  // #swagger.tags = ['Kakao OAuth']
  try {
    const user = req.user;

    await axios.post(
      'https://kapi.kakao.com/v1/user/logout',
      {},
      {
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${user?.accessToken}`,
        },
      },
    );

    res.status(200).json({ message: STATUS_MESSAGES.LOGOUT_SUCCESS });
  } catch (error) {
    next(error);
  }
});

router.delete('/unlink', loginChecker, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const userId = user?.sub;

    const resUserData = await axios.post(
      'https://kapi.kakao.com/v1/user/unlink',
      {},
      {
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${user?.accessToken}`,
        },
      },
    );

    await UserModel.findOneAndDelete({ kakaoId: resUserData.data.id });
    await Promise.all([
      UserResultModel.deleteMany({ userId }),
      LikeModel.deleteMany({ userId }),
      CommentModel.deleteMany({ user: userId }),
    ]);

    return res.status(200).json({ message: STATUS_MESSAGES.DELETED });
  } catch (error) {
    next(error);
  }
});

export default router;
