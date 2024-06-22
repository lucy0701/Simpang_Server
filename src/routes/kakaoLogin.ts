import axios from 'axios';
import express, { Request, Response, NextFunction } from 'express';
import { FE_URL, REST_API_KEY, SECRET_KEY } from '../constants';
import UserModel from '../schemas/User';
import LoginModel from '../schemas/Login';
import { IUser } from '../interfaces';
import { AuthToken, UserInfoResponse } from '../types/auth';
import JwtService from '../utils/jwtService';

const router = express.Router();

router.get('/', async (req: Request<{}, {}, {}, { code: string }>, res: Response, next: NextFunction) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is missing.' });
    }

    const authToken = await axios.post<AuthToken>(
      'https://kauth.kakao.com/oauth/token',
      {},
      {
        headers: { 'Content-type': 'application/x-www-form-urlencoded' },
        params: {
          grant_type: 'authorization_code',
          client_id: REST_API_KEY,
          redirect_uri: FE_URL + '/login/kakao',
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

    await LoginModel.create({
      userId: user._id,
    });

    const userInfo: Pick<IUser, 'name' | 'thumbnail' | 'createdAt'> = {
      name: user.name,
      thumbnail: user.thumbnail,
      createdAt: user.createdAt,
    };

    const token = JwtService.createJWT(user);

    res.setHeader('Authorization', `Bearer ${token}`);
    res.status(200).json(userInfo);
  } catch (error) {
    console.error('Error during Kakao OAuth process:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error response data:', error.response?.data);
    }
    next(error);
  }
});

export default router;
