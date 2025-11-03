import { PublishJob, QUEUES, createLogger, createWorker } from '@ezclip/common';

const logger = createLogger('publish');

export const processPublishJob = async (job: PublishJob) => {
  logger.info({ file: job.file, caption: job.caption }, 'Would publish');
};

const main = () => {
  createWorker<PublishJob>(QUEUES.publish, async (bullJob: any) => {
    await processPublishJob(bullJob.data);
  });

  logger.info('publish worker ready');
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
