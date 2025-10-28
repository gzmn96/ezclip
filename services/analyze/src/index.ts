import path from 'node:path';
import { promises as fs } from 'node:fs';
import { AnalyzeJob, ClipJob, QUEUES, Scene, createLogger, createQueue, createWorker, loadConfig, serializeScenes } from '@ezclip/common';

type ClipQueueLike = {
  add: (
    name: string,
    data: ClipJob,
    opts?: { jobId?: string },
  ) => Promise<unknown>;
};

const logger = createLogger('analyze');
const config = loadConfig();

let clipQueue: ClipQueueLike = createQueue<ClipJob>(QUEUES.clip);

export const setClipQueue = (queue: ClipQueueLike) => {
  clipQueue = queue;
};

export const processAnalyzeJob = async (job: AnalyzeJob) => {
  const { videoId, chunkPath, chunkIndex } = job;
  logger.info({ videoId, chunkIndex }, 'processing analyze job');

  const scene: Scene = {
    start: 1,
    end: 6,
    score: 0.92,
    reason: 'exciting',
  };

  const scenesPath = path.join(config.tmpDir, `${videoId}-chunk-${chunkIndex}-scenes.json`);
  await fs.writeFile(scenesPath, serializeScenes([scene]));

  const clipJob: ClipJob = {
    videoId,
    chunkPath,
    scene,
    outBase: path.join(config.tmpDir, `${videoId}-chunk-${chunkIndex}`),
  };

  await clipQueue.add('clip', clipJob, { jobId: `${videoId}:${chunkIndex}:${scene.start}` });
  logger.info({ videoId, chunkIndex }, 'enqueued clip job');
};

const main = () => {
  createWorker<AnalyzeJob>(QUEUES.analyze, async (bullJob) => {
    await processAnalyzeJob(bullJob.data);
  });
  logger.info('analyze worker ready');
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
