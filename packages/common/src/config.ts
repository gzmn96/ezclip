import dotenv from 'dotenv';
import { envMap, EnvSettings } from './environments.js';

dotenv.config();

export interface AppConfig {
  redisUrl: string;
  databaseUrl: string | undefined;
  ytHubSecret: string | undefined;
  tmpDir: string;
  sampleVideoPath: string | undefined;
  gcsBucket: string | undefined;
  environment: 'test' | 'prod' | string;
  projectId: string | undefined;
  envSettings?: EnvSettings;
}

export const loadConfig = (): AppConfig => {
  const environment = (process.env.ENVIRONMENT ?? process.env.NODE_ENV ?? 'test') as AppConfig['environment'];
  const projectId = process.env.PROJECT_ID;

  return {
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    databaseUrl: process.env.DATABASE_URL,
    ytHubSecret: process.env.YT_HUB_SECRET,
    tmpDir: process.env.TMP_DIR ?? '/app/tmp',
    sampleVideoPath: process.env.SAMPLE_VIDEO_PATH,
    gcsBucket: process.env.GCS_BUCKET,
    environment,
    projectId,
    envSettings: envMap[environment] ?? envMap.test,
  };
};
