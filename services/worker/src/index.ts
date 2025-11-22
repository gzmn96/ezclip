import path from 'node:path';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import {
    AnalyzeJob,
    ClipJob,
    IngestJob,
    PublishJob,
    QUEUES,
    Scene,
    assertRequiredEnv,
    createLogger,
    createQueue,
    createWorker,
    loadConfig,
    planChunks,
    serializeScenes,
    runFfmpeg,
    ChunkPlan,
} from '@ezclip/common';

const config = loadConfig();
console.log('DEBUG: REDIS_URL is', config.redisUrl);
assertRequiredEnv('REDIS_URL', config.redisUrl);
assertRequiredEnv('GCS_BUCKET', config.gcsBucket);
if (config.environment === 'test') {
    assertRequiredEnv('SAMPLE_VIDEO_PATH', config.sampleVideoPath);
}

const logger = createLogger('worker');

// Queues
const analyzeQueue = createQueue<AnalyzeJob>(QUEUES.analyze);
const clipQueue = createQueue<ClipJob>(QUEUES.clip);
const publishQueue = createQueue<PublishJob>(QUEUES.publish);

// --- Ingest Logic ---
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

const processIngestJob = async (job: IngestJob) => {
    const { videoId } = job;
    logger.info({ videoId }, 'processing ingest job');
    const downloadPath = await ensureSampleVideo(videoId);
    const duration = await probeDuration(downloadPath);
    const chunkPlans = planChunks(duration);

    await Promise.all(
        chunkPlans.map(async (chunk: ChunkPlan) => {
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

// --- Analyze Logic ---
const processAnalyzeJob = async (job: AnalyzeJob) => {
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

// --- Clipper Logic ---
const processClipJob = async (job: ClipJob) => {
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

// --- Publish Logic ---
const processPublishJob = async (job: PublishJob) => {
    logger.info({ file: job.file, caption: job.caption }, 'Would publish');
};

// --- Main ---
const main = () => {
    createWorker<IngestJob>(QUEUES.ingest, async (bullJob: any) => {
        await processIngestJob(bullJob.data);
    });

    createWorker<AnalyzeJob>(QUEUES.analyze, async (bullJob: any) => {
        await processAnalyzeJob(bullJob.data);
    });

    createWorker<ClipJob>(QUEUES.clip, async (bullJob: any) => {
        await processClipJob(bullJob.data);
    });

    createWorker<PublishJob>(QUEUES.publish, async (bullJob: any) => {
        await processPublishJob(bullJob.data);
    });

    logger.info('worker service ready (ingest, analyze, clipper, publish)');
};

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
