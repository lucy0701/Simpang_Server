import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { SECRET_KEY } from '../constants';
import { IUser } from '../interfaces/user';
import UserModel from '../schemas/User';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  try {
    if (!authHeader) {
      return res.status(401).send({ message: '엑세스 토큰을 입력해 주세요.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).send({ message: '엑세스 토큰을 입력해 주세요.' });
    }

    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;

    const userId = decoded.userId;

    if (!userId) {
      return res.status(403).send({ message: '유효하지 않은 토큰입니다.' });
    }

    const user = await UserModel.findOne<IUser>({ kakaoId: userId }).exec();

    if (!user) {
      return res.status(404).send({ message: '유저를 찾을 수 없습니다.' });
    }

    req.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(403).send({ message: '엑세스 토큰이 만료되었습니다.' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).send({ message: '유효하지 않은 토큰입니다.' });
    }

    console.error('JWT verification error:', error);
    return res.status(500).send({ message: '서버 오류입니다.' });
  }
};

export default authMiddleware;
