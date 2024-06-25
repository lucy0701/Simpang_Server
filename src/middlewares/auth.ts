import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { STATUS_MESSAGES } from '../constants';
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
      return res.status(401).send({ message: STATUS_MESSAGES.PROVIDE_ACCESS_TOKEN });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(403).send({ message: STATUS_MESSAGES.TOKEN_EXPIRED });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).send({ message: STATUS_MESSAGES.TOKEN_INVALID });
    }
    next(error);
  }
};

export const roleChecker = (roles: Role[]) => (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user || !roles.includes(user.role)) {
    return res.status(403).json({ message: STATUS_MESSAGES.UNAUTHORIZED });
  }

  next();
};
