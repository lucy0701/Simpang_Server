import { Request } from 'express';
import jwt from 'jsonwebtoken';

import { SECRET_KEY } from '../constants';
import { IPayload, IUser } from '../interfaces';

export default class JwtService {
  static createJWT = (user: IUser, accessToken: string): string => {
    const exp = user.role === 'Admin' || user.role === 'Creator' ? '5h' : '1h';

    return jwt.sign(
      {
        sub: user._id,
        role: user.role,
        accessToken,
      },
      SECRET_KEY,
      {
        expiresIn: exp,
      },
    );
  };

  static extractToken = (req: Request) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.includes('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    return token;
  };

  static decodeJWT = (token: string) => {
    try {
      const decode = jwt.verify(token, SECRET_KEY) as IPayload;

      return decode;
    } catch (_error) {
      return null;
    }
  };

  static getUserRequest(req: Request) {
    const token = this.extractToken(req);
    if (!token) return null;

    const user = this.decodeJWT(token);
    return user;
  }
}
