import { Request } from 'express';
import { Event } from 'src/modules/event/models/event.model';
import { User } from 'src/modules/user/models/user.model';

export interface AuthRequest extends Request {
    user?: User | null;
    // Postoji li neki poseban razlog zasto drzimo event u samom requestu?
    // Ne deluje mi ovo kao dobra praksa
    event?: Event | null;
}
