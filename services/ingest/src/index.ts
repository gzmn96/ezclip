import path from 'node:path';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { AnalyzeJob, IngestJob, QUEUES, createLogger, createQueue, createWorker, loadConfig, planChunks } from '@ezclip/common';

type AnalyzeQueueLike = {
  add: (
    name: string,
    data: AnalyzeJob,
    opts?: { jobId?: string },
  ) => Promise<unknown>;
};

const config = loadConfig();
const logger = createLogger('ingest');

let analyzeQueue: AnalyzeQueueLike = createQueue<AnalyzeJob>(QUEUES.analyze);

export const setAnalyzeQueue = (queue: AnalyzeQueueLike) => {
  analyzeQueue = queue;
};

const ensureSampleVideo = async (videoId: string) => {
  await fs.mkdir(config.tmpDir, { recursive: true });
  const targetPath = path.join(config.tmpDir, `${videoId}.mp4`);
  if (config.sampleVideoPath) {
    await fs.copyFile(config.sampleVideoPath, targetPath);
    return targetPath;
  }
  await fs.writeFile(targetPath, Buffer.alloc(0));
  return targetPath;
};

const probeDuration = async (file: string): Promise<number> => {
  return await new Promise((resolve, reject) => {
    const args = ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file];
    const proc = spawn('ffprobe', args, { stdio: ['ignore', 'pipe', 'inherit'] });
    let output = '';
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(parseFloat(output.trim()));
      } else {
        reject(new Error(`ffprobe exited with ${code}`));
      }
    });
  });
};

export const processIngestJob = async (job: IngestJob) => {
  const { videoId } = job;
  logger.info({ videoId }, 'processing ingest job');
  const downloadPath = await ensureSampleVideo(videoId);
  const duration = await probeDuration(downloadPath);
  const chunkPlans = planChunks(duration);

  await Promise.all(
    chunkPlans.map(async (chunk) => {
      const chunkPath = path.join(config.tmpDir, `${videoId}-chunk-${chunk.index}.mp4`);
      await fs.copyFile(downloadPath, chunkPath);
      const analyzeJob: AnalyzeJob = {
        videoId,
        chunkPath,
        chunkIndex: chunk.index,
      };
      await analyzeQueue.add('chunk', analyzeJob, {
        jobId: `${videoId}:${chunk.index}`,
      });
      logger.info({ videoId, chunkIndex: chunk.index }, 'enqueued analyze job');
    }),
  );

  return { downloadPath, chunkPlans };
};

const main = () => {
  createWorker<IngestJob>(QUEUES.ingest, async (bullJob) => {
    await processIngestJob(bullJob.data);
  });

  logger.info('ingest worker ready');
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
