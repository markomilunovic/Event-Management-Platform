import { Injectable, NestMiddleware } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    req.traceId = uuidv4();
    next();
  }
}
