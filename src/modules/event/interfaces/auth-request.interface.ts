import { User } from '@modules/user/models/user.model';
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: User | null;
}
