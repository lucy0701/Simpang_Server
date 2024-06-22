import { IPayload } from '../../interfaces';

declare global {
  namespace Express {
    interface Request {
      user?: IPayload | null;
    }
  }
}
