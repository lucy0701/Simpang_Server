import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { Role } from '../types';
import JwtService from '../utils/jwtService';

export const tokenChecker = (req: Request, _res: Response, next: NextFunction) => {
  const user = JwtService.getUserRequest(req);
  req.user = user;
  next();
};

export const loginChecker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = JwtService.getUserRequest(req);

    if (!user) {
      return res.status(401).send({ message: '엑세스 토큰을 입력해 주세요.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(403).send({ message: '엑세스 토큰이 만료되었습니다.' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).send({ message: '유효하지 않은 토큰입니다.' });
    }
    next(error);
  }
};

export const roleChecker = (roles: Role[]) => (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user || !roles.includes(user.role)) {
    return res.status(403).json({ message: '접근 권한이 없습니다.' });
  }

  next();
};
