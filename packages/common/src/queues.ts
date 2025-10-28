export const QUEUES = {
  ingest: 'ingest',
  analyze: 'analyze',
  clip: 'clip',
  publish: 'publish',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];
