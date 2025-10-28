import { promises as fs } from 'node:fs';
import { ClipJob, PublishJob, QUEUES, createLogger, createQueue, createWorker, loadConfig, runFfmpeg } from '@ezclip/common';

type PublishQueueLike = {
  add: (
    name: string,
    data: PublishJob,
    opts?: { jobId?: string },
  ) => Promise<unknown>;
};

const logger = createLogger('clipper');
const config = loadConfig();

let publishQueue: PublishQueueLike = createQueue<PublishJob>(QUEUES.publish);

export const setPublishQueue = (queue: PublishQueueLike) => {
  publishQueue = queue;
};

export const processClipJob = async (job: ClipJob) => {
  const { videoId, chunkPath, scene, outBase } = job;
  logger.info({ videoId, chunkPath }, 'processing clip job');
  await fs.mkdir(config.tmpDir, { recursive: true });

  const duration = scene.end - scene.start;
  const verticalPath = `${outBase}-vertical.mp4`;
  const squarePath = `${outBase}-square.mp4`;

  await runFfmpeg({ input: chunkPath, output: verticalPath, start: scene.start, duration, aspect: '9:16' });
  await runFfmpeg({ input: chunkPath, output: squarePath, start: scene.start, duration, aspect: '1:1' });

  const caption = `Clip from ${videoId}: ${scene.reason}`;
  const publishJob: PublishJob = {
    file: verticalPath,
    caption,
  };

  await publishQueue.add('publish', publishJob, { jobId: `${videoId}:${scene.start}:publish` });
  logger.info({ verticalPath, squarePath }, 'rendered clips');

  return { verticalPath, squarePath };
};

const main = () => {
  createWorker<ClipJob>(QUEUES.clip, async (bullJob) => {
    await processClipJob(bullJob.data);
  });
  logger.info('clipper worker ready');
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
