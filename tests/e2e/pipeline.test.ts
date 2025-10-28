import path from 'node:path';
import os from 'node:os';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AnalyzeJob, ClipJob, PublishJob } from '@common/types';

describe('end-to-end pipeline', () => {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const samplePath = path.resolve(currentDir, '../assets/sample.mp4');
  let tmpDir: string;
  let processIngestJob: (job: { videoId: string }) => Promise<{ chunkPlans: Array<{ index: number }> }>;
  let setAnalyzeQueue: (queue: { add: (name: string, data: AnalyzeJob) => Promise<unknown> }) => void;
  let processAnalyzeJob: (job: AnalyzeJob) => Promise<void>;
  let setClipQueue: (queue: { add: (name: string, data: ClipJob) => Promise<unknown> }) => void;
  let processClipJob: (job: ClipJob) => Promise<{ verticalPath: string; squarePath: string }>;
  let setPublishQueue: (queue: { add: (name: string, data: PublishJob) => Promise<unknown> }) => void;
  let processPublishJob: (job: PublishJob) => Promise<void>;

  beforeAll(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ezclip-test-'));
    process.env.TMP_DIR = tmpDir;
    process.env.SAMPLE_VIDEO_PATH = samplePath;

    ({ processIngestJob, setAnalyzeQueue } = await import('../../services/ingest/src/index.ts'));
    ({ processAnalyzeJob, setClipQueue } = await import('../../services/analyze/src/index.ts'));
    ({ processClipJob, setPublishQueue } = await import('../../services/clipper/src/index.ts'));
    ({ processPublishJob } = await import('../../services/publish/src/index.ts'));
  });

  it('processes ingest -> analyze -> clip -> publish', async () => {
    const analyzeJobs: AnalyzeJob[] = [];
    const clipJobs: ClipJob[] = [];
    const publishJobs: PublishJob[] = [];

    setAnalyzeQueue({
      add: async (_name, data) => {
        analyzeJobs.push(data);
        return { id: `${data.videoId}:${data.chunkIndex}` } as any;
      },
    });

    setClipQueue({
      add: async (_name, data) => {
        clipJobs.push(data);
        return { id: `${data.videoId}:${data.scene.start}` } as any;
      },
    });

    setPublishQueue({
      add: async (_name, data) => {
        publishJobs.push(data);
        return { id: data.file } as any;
      },
    });

    const videoId = 'test-video';
    const { chunkPlans } = await processIngestJob({ videoId });
    expect(chunkPlans.length).toBeGreaterThan(0);
    expect(analyzeJobs).toHaveLength(chunkPlans.length);

    for (const job of analyzeJobs) {
      await processAnalyzeJob(job);
    }
    expect(clipJobs).toHaveLength(analyzeJobs.length);

    for (const job of clipJobs) {
      const { verticalPath, squarePath } = await processClipJob(job);
      expect(await fs.stat(verticalPath)).toBeDefined();
      expect(await fs.stat(squarePath)).toBeDefined();
    }

    for (const job of publishJobs) {
      await processPublishJob(job);
    }
    expect(publishJobs.length).toBe(clipJobs.length);
  });

  afterAll(async () => {
    if (tmpDir) {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
