export type EnvSettings = {
  redisPrefix?: string;
  tmpBucket?: string;
};

export const envMap: Record<string, EnvSettings> = {
  test: {
    redisPrefix: 'test',
    tmpBucket: 'ezclip-test-tmp',
  },
  prod: {
    redisPrefix: 'prod',
    tmpBucket: 'ezclip-prod-tmp',
  },
};
