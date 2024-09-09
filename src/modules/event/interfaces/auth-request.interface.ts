import { Request } from 'express';

import { User } from '@modules/user/models/user.model';

export interface AuthRequest extends Request {
  user?: User | null;
}
