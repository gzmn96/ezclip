import pino from 'pino';

export const createLogger = (module: string) =>
  pino({
    name: module,
    level: process.env.LOG_LEVEL ?? 'info',
    transport: process.env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
  });
