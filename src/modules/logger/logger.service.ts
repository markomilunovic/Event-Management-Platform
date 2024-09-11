import { Injectable } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggerService {
  private readonly logger;

  constructor() {
    this.logger = createLogger({
      level: 'error',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message, traceId }) => {
          return `${timestamp} [${level}] [traceId: ${traceId}] ${message}`;
        }),
      ),
      transports: [
        new transports.Console(),
        new transports.File({ filename: 'error.log' }),
      ],
    });
  }

  logError(message: string): void {
    const traceId = uuidv4();
    this.logger.error({ message, traceId });
  }
}
