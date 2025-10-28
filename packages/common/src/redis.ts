import { Queue, QueueScheduler, Worker } from 'bullmq';
import { loadConfig } from './config.js';

const config = loadConfig();

const connection = { url: config.redisUrl } as const;

export const createQueue = <T>(name: string) => {
  new QueueScheduler(name, { connection }).waitUntilReady().catch(() => undefined);
  return new Queue<T>(name, { connection, prefix: 'ezclip' });
};

export const createWorker = <T>(
  name: string,
  processor: Parameters<typeof Worker<T>>[1],
) => {
  return new Worker<T>(name, processor, { connection, prefix: 'ezclip' });
};
