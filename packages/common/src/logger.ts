import pino from 'pino';

export const createLogger = (module: string) =>
  // pino's type shape can vary by version / tsconfig; cast to any to avoid
  // "has no call signatures" compile errors inside Docker build.
  (pino as any)({
    name: module,
    level: process.env.LOG_LEVEL ?? 'info',
    transport: process.env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
  });