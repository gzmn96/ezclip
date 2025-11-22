import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { loadConfig } from './config.js';

// Note: bullmq types/exports can vary by version. To avoid build-time
// type mismatches inside Docker images we keep the connection and
// processor typing loose here. This preserves runtime behavior while
// avoiding strict type coupling to a specific bullmq typing surface.

const config = loadConfig();

const connection: any = { url: config.redisUrl };

export const createQueue = <T = unknown>(name: string) => {
  // If you need a QueueScheduler in the future, re-add it at runtime
  // (dynamic import) or pin bullmq to a version whose typings match.
  return new Queue<T>(name, { connection, prefix: 'ezclip' });
};

export const createWorker = <T = unknown>(name: string, processor: any) => {
  return new Worker<T>(name, processor, { connection, prefix: 'ezclip' });
};

export const createRedisClient = () => {
  return new Redis(config.redisUrl);
};
