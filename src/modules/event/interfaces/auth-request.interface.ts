import { Request } from 'express';
import { User } from 'src/modules/user/models/user.model';
import { Event } from 'src/modules/event/models/event.model';

export interface AuthRequest extends Request {
    user?: User | null;
}
