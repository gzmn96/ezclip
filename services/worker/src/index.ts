import path from 'node:path';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import dotenv from 'dotenv';
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
    serializeScenes,
    createRedisClient,
} from '@ezclip/common';

import { GcsService } from './services/GcsService.js';
import { GeminiService } from './services/GeminiService.js';
import { VideoIntelligenceService } from './services/VideoIntelligenceService.js';
import { WhisperService } from './services/WhisperService.js';
import { GeminiFlashService, InterestRegion } from './services/GeminiFlashService.js';
import { SocialPublishService } from './services/SocialPublishService.js';

dotenv.config();

const config = loadConfig();
const logger = createLogger('worker');

// Environment checks
const isTest = config.environment === 'test';
const mockAi = process.env.MOCK_AI === 'true' || isTest;

logger.info({ environment: config.environment, mockAi, gcsBucket: config.gcsBucket }, 'Worker starting');

if (!mockAi) {
    assertRequiredEnv('REDIS_URL', config.redisUrl);
    assertRequiredEnv('GCS_BUCKET', config.gcsBucket);
    assertRequiredEnv('GOOGLE_CLOUD_PROJECT', process.env.GOOGLE_CLOUD_PROJECT);
    assertRequiredEnv('OPENAI_API_KEY', process.env.OPENAI_API_KEY);
} else {
    logger.warn('Running in MOCK/TEST mode. Real AI APIs will be skipped.');
}

if (isTest) {
    assertRequiredEnv('SAMPLE_VIDEO_PATH', config.sampleVideoPath);
}

// Services (initialized only if needed or with dummy values)
const gcsService = new GcsService(config.gcsBucket || 'mock-bucket');
const geminiService = mockAi ? null : new GeminiService(process.env.GOOGLE_CLOUD_PROJECT!);
const videoIntelligenceService = mockAi ? null : new VideoIntelligenceService();
const whisperService = mockAi ? null : new WhisperService(process.env.OPENAI_API_KEY!);
const geminiFlashService = mockAi ? null : new GeminiFlashService(process.env.GOOGLE_CLOUD_PROJECT!);

// Redis Publisher for Progress Updates
const redisPublisher = createRedisClient();

const publishProgress = async (jobId: string, status: string, progress: number) => {
    try {
        const channel = `job-progress:${jobId}`;
        const payload = JSON.stringify({ status, progress });
        await redisPublisher.publish(channel, payload);
        // Also store state so new subscribers can get the latest status immediately (optional but good practice)
        // await redisPublisher.set(`job-status:${jobId}`, payload, 'EX', 3600); 
    } catch (error) {
        logger.error({ error, jobId }, 'Failed to publish progress');
    }
};

// Queues
const analyzeQueue = createQueue<AnalyzeJob>(QUEUES.analyze);
const clipQueue = createQueue<ClipJob>(QUEUES.clip);
const publishQueue = createQueue<PublishJob>(QUEUES.publish);

// Local helper for flexible FFmpeg usage
const runFfmpegCommand = async (args: string[]) => {
    return new Promise<void>((resolve, reject) => {
        const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'inherit'] });
        proc.on('error', reject);
        proc.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`ffmpeg exited with ${code}`));
            }
        });
    });
};

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

const mergeRegions = (regions: InterestRegion[], padding: number, maxDuration: number): InterestRegion[] => {
    if (regions.length === 0) return [];

    // Sort by start time
    regions.sort((a, b) => a.start - b.start);

    const merged: InterestRegion[] = [];
    let current = { ...regions[0] };

    // Apply padding
    current.start = Math.max(0, current.start - padding);
    current.end = Math.min(maxDuration, current.end + padding);

    for (let i = 1; i < regions.length; i++) {
        const next = { ...regions[i] };
        // Apply padding to next
        next.start = Math.max(0, next.start - padding);
        next.end = Math.min(maxDuration, next.end + padding);

        if (next.start <= current.end) {
            // Overlap, merge
            current.end = Math.max(current.end, next.end);
            // Combine reasons
            current.reason = `${current.reason} + ${next.reason}`;
            current.score = Math.max(current.score, next.score);
        } else {
            merged.push(current);
            current = next;
        }
    }
    merged.push(current);
    return merged;
};

const processIngestJob = async (job: IngestJob) => {
    const { videoId } = job;
    logger.info({ videoId }, 'processing ingest job (Audio-First Filtering)');
    await publishProgress(videoId, 'Starting ingest...', 5);

    const downloadPath = await ensureSampleVideo(videoId);
    const duration = await probeDuration(downloadPath);

    // 1. Extract Audio
    await publishProgress(videoId, 'Extracting audio track...', 10);
    const audioPath = path.join(config.tmpDir, `${videoId}-full.mp3`);
    logger.info('Extracting full audio...');
    await runFfmpegCommand([
        '-y', '-i', downloadPath,
        '-vn', '-acodec', 'libmp3lame',
        audioPath
    ]);

    // 2. Transcribe Full Audio
    await publishProgress(videoId, 'Transcribing audio with Whisper...', 20);
    let transcriptText = '';
    if (!mockAi && whisperService) {
        logger.info('Transcribing full audio...');
        const transcription = await whisperService.transcribe(audioPath);
        transcriptText = transcription.text;
    } else {
        transcriptText = "Mock transcript: This is a video about viral marketing. It's very funny and interesting.";
    }

    // 3. Identify High Interest Regions with Gemini Flash
    await publishProgress(videoId, 'Analyzing content with Gemini Flash...', 40);
    let regions: InterestRegion[] = [];
    if (!mockAi && geminiFlashService) {
        logger.info('Analyzing transcript with Gemini Flash...');
        regions = await geminiFlashService.findHighInterestRegions(transcriptText);
    } else {
        regions = [{ start: 0, end: 10, reason: "Mock region", score: 90 }];
    }

    logger.info({ regionsCount: regions.length }, 'Found high interest regions');

    // 4. Merge and Pad Regions
    await publishProgress(videoId, 'Optimizing segments...', 50);
    const PADDING_SECONDS = 5;
    const segments = mergeRegions(regions, PADDING_SECONDS, duration);
    logger.info({ segmentsCount: segments.length }, 'Merged into segments');

    // 5. Cut Segments and Queue Analyze Jobs
    await publishProgress(videoId, `Cutting ${segments.length} high-interest segments...`, 60);
    await Promise.all(
        segments.map(async (segment, index) => {
            const segmentPath = path.join(config.tmpDir, `${videoId}-segment-${index}.mp4`);
            const segmentDuration = segment.end - segment.start;

            // Cut segment
            await runFfmpegCommand([
                '-y',
                '-ss', segment.start.toString(),
                '-i', downloadPath,
                '-t', segmentDuration.toString(),
                '-c', 'copy',
                segmentPath
            ]);

            const analyzeJob: AnalyzeJob = {
                videoId,
                chunkPath: segmentPath,
                chunkIndex: index, // Using segment index as chunk index
            };

            await analyzeQueue.add('chunk', analyzeJob, {
                jobId: `${videoId}:segment:${index}`,
            });
            logger.info({ videoId, segmentIndex: index, start: segment.start, end: segment.end }, 'enqueued analyze job for segment');
        }),
    );

    await publishProgress(videoId, 'Segments queued for visual analysis', 70);
    return { downloadPath, segments };
};

// --- Analyze Logic ---
const processAnalyzeJob = async (job: AnalyzeJob) => {
    const { videoId, chunkPath, chunkIndex } = job;
    logger.info({ videoId, chunkIndex }, 'processing analyze job (Supreme Brain - Segment Analysis)');
    // Note: We might want to publish progress here too, but it could be noisy if many segments run in parallel.
    // Maybe just publish "Analyzing segment X..."
    await publishProgress(videoId, `Analyzing segment ${chunkIndex + 1}...`, 75);

    let gcsUri = `gs://${config.gcsBucket || 'mock-bucket'}/videos/${videoId}/segments/${chunkIndex}.mp4`;

    // 1. Upload to GCS (Skip if mock)
    if (!mockAi) {
        const destination = `videos/${videoId}/segments/${chunkIndex}.mp4`;
        gcsUri = await gcsService.uploadFile(chunkPath, destination);
        logger.info({ gcsUri }, 'Uploaded segment to GCS');
    } else {
        logger.info('Skipping GCS upload in mock mode');
    }

    // 2. Analyze with Gemini 1.5 Pro (Visual Analysis)
    let viralMoments;
    if (!mockAi && geminiService) {
        try {
            // We are analyzing a specific "High Interest" segment now.
            // We still ask Gemini to find the BEST moments within this segment.
            viralMoments = await geminiService.analyzeVideo(gcsUri);
        } catch (error) {
            logger.error({ error }, 'Gemini analysis failed');
            throw error; // Retry job
        }
    } else {
        // Mock response
        viralMoments = [{
            start_time: "00:00",
            end_time: "00:10",
            viral_score: 95,
            explanation: "Mock viral moment for testing"
        }];
    }

    logger.info({ viralMoments }, 'Gemini analysis complete');

    // 3. Process moments
    for (const moment of viralMoments) {
        // Convert MM:SS to seconds
        const parseTime = (timeStr: string) => {
            if (timeStr.includes(':')) {
                const parts = timeStr.split(':');
                return parseInt(parts[0]) * 60 + parseInt(parts[1]);
            }
            return parseFloat(timeStr);
        };

        const start = parseTime(moment.start_time);
        const end = parseTime(moment.end_time);

        const scene: Scene = {
            start,
            end,
            score: moment.viral_score / 100, // Normalize to 0-1
            reason: moment.explanation,
        };

        const scenesPath = path.join(config.tmpDir, `${videoId}-segment-${chunkIndex}-scenes.json`);
        await fs.writeFile(scenesPath, serializeScenes([scene]));

        const clipJob: ClipJob = {
            videoId,
            chunkPath,
            scene,
            outBase: path.join(config.tmpDir, `${videoId}-segment-${chunkIndex}`),
        };

        (clipJob as any).gcsUri = gcsUri;

        await clipQueue.add('clip', clipJob, { jobId: `${videoId}:${chunkIndex}:${scene.start}` });
        logger.info({ videoId, chunkIndex, scene }, 'enqueued clip job');
    }
};

// --- Clipper Logic ---
const processClipJob = async (job: ClipJob) => {
    const { videoId, chunkPath, scene, outBase } = job;
    const gcsUri = (job as any).gcsUri; // Retrieved from analyze step

    logger.info({ videoId, chunkPath }, 'processing clip job (Supreme Brain)');
    await publishProgress(videoId, 'Smart cropping and rendering...', 90);

    await fs.mkdir(config.tmpDir, { recursive: true });

    const duration = scene.end - scene.start;
    const verticalPath = `${outBase}-vertical.mp4`;
    const squarePath = `${outBase}-square.mp4`;

    // 1. Smart Crop with Video Intelligence
    let cropFilter = ''; // Default to center crop if fails
    if (!mockAi && videoIntelligenceService && gcsUri) {
        try {
            const annotations = await videoIntelligenceService.analyzeForCropping(gcsUri);
            // Calculate crop for the middle of the clip to be representative
            const midPoint = scene.start + duration / 2;
            const crop = videoIntelligenceService.calculateCrop(midPoint, annotations);

            if (crop) {
                // Convert normalized coordinates to FFmpeg crop filter
                // We need video dimensions first. For now assuming 1080p input or similar.
                // A robust implementation would probe dimensions.
                // Let's assume standard HD 1920x1080 for the math:
                const inputW = 1920;
                const inputH = 1080;

                const x = Math.floor(crop.x * inputW);
                // const y = Math.floor(crop.y * inputH); // We usually want full height for vertical

                // For 9:16 from 16:9, we want width = height * (9/16)
                const targetW = Math.floor(inputH * (9 / 16));

                // Center the crop window around the person's x
                let cropX = x - targetW / 2;
                // Clamp
                if (cropX < 0) cropX = 0;
                if (cropX + targetW > inputW) cropX = inputW - targetW;

                cropFilter = `crop=${targetW}:${inputH}:${cropX}:0`;
                logger.info({ cropFilter }, 'Calculated smart crop');
            }
        } catch (error) {
            logger.error({ error }, 'Smart crop failed, using default');
        }
    }


    // 2. Transcribe with Whisper (for future caption overlay)
    // Extract audio first
    const audioPath = `${outBase}-audio.mp3`;
    try {
        await runFfmpegCommand([
            '-y',
            '-ss', scene.start.toString(),
            '-i', chunkPath,
            '-t', duration.toString(),
            '-vn',
            '-acodec', 'libmp3lame',
            audioPath
        ]);

        if (!mockAi && whisperService) {
            const transcription = await whisperService.transcribe(audioPath);
            logger.info({ transcriptionLength: transcription.text.length }, 'Whisper transcription complete');
            // Save transcription for later burning
            await fs.writeFile(`${outBase}-transcription.json`, JSON.stringify(transcription, null, 2));
        } else {
            await fs.writeFile(`${outBase}-transcription.json`, JSON.stringify({ text: "Mock transcription" }));
        }
    } catch (error) {
        logger.error({ error }, 'Whisper transcription/extraction failed');
    }

    // 3. Render Clips
    // Vertical 9:16
    const verticalFilters = cropFilter || 'scale=1080:-2,crop=1080:1920'; // Use smart crop or default center crop

    await runFfmpegCommand([
        '-y',
        '-ss', scene.start.toString(),
        '-i', chunkPath,
        '-t', duration.toString(),
        '-vf', verticalFilters,
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23',
        '-c:a', 'aac',
        verticalPath
    ]);

    // Square 1:1 (Simple center crop for now, or could use smart crop logic adapted for square)
    const squareFilters = 'scale=1080:-2,crop=1080:1080';
    await runFfmpegCommand([
        '-y',
        '-ss', scene.start.toString(),
        '-i', chunkPath,
        '-t', duration.toString(),
        '-vf', squareFilters,
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23',
        '-c:a', 'aac',
        squarePath
    ]);

    const caption = `Clip from ${videoId}: ${scene.reason}`;
    const publishJob: PublishJob = {
        file: verticalPath,
        caption,
    };

    await publishQueue.add('publish', publishJob, { jobId: `${videoId}:${scene.start}:publish` });
    logger.info({ verticalPath, squarePath }, 'rendered clips');
    await publishProgress(videoId, 'Clip ready!', 100);

    return { verticalPath, squarePath };
};

// --- Publish Logic ---
const socialPublishService = new SocialPublishService();

const processPublishJob = async (job: PublishJob) => {
    logger.info({ file: job.file, caption: job.caption }, 'Processing publish job');

    // In a real scenario, we would get the userId from the job data.
    // For now, we'll use a placeholder or extract it if available.
    const userId = "user_placeholder";

    try {
        // Auto-publish to YouTube Shorts as part of the "Auto-Pilot"
        await socialPublishService.publish(userId, job.file, 'youtube', {
            title: job.caption.substring(0, 100),
            description: job.caption + "\n\n#Shorts #Ezclip",
            privacyStatus: 'private' // Safety first
        });

        await publishProgress((job as any).jobId || 'unknown', 'Published to YouTube!', 100);
    } catch (error) {
        logger.error({ error }, 'Failed to publish');
        // Don't fail the whole job, just log it.
    }
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

    logger.info('Supreme Brain worker service ready');
};

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
