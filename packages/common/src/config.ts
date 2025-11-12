import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  redisUrl: string;
  databaseUrl: string | undefined;
  ytHubSecret: string | undefined;
  tmpDir: string;
  sampleVideoPath: string | undefined;
  gcsBucket: string | undefined;
}

export const loadConfig = (): AppConfig => {
  return {
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
    databaseUrl: process.env.DATABASE_URL,
    ytHubSecret: process.env.YT_HUB_SECRET,
    tmpDir: process.env.TMP_DIR ?? '/app/tmp',
    sampleVideoPath: process.env.SAMPLE_VIDEO_PATH,
    gcsBucket: process.env.GCS_BUCKET,
  };
};
