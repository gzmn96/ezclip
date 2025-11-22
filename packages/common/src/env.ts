export const assertRequiredEnv = (name: string, value: unknown) => {
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
};
