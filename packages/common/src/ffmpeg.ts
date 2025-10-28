import { spawn } from 'node:child_process';

export interface ClipSpec {
  input: string;
  output: string;
  start: number;
  duration: number;
  aspect: '9:16' | '1:1';
}

export const buildFilters = (aspect: ClipSpec['aspect']) => {
  const baseScale = 'scale=1080:-2';
  if (aspect === '9:16') {
    return `${baseScale},crop=1080:1920`;
  }
  return `${baseScale},crop=1080:1080`;
};

export const runFfmpeg = async ({ input, output, start, duration, aspect }: ClipSpec) => {
  await new Promise<void>((resolve, reject) => {
    const filters = buildFilters(aspect);
    const args = [
      '-y',
      '-ss',
      start.toString(),
      '-i',
      input,
      '-t',
      duration.toString(),
      '-vf',
      filters,
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '23',
      '-c:a',
      'aac',
      output,
    ];

    const proc = spawn('ffmpeg', args, { stdio: 'inherit' });
    proc.on('error', reject);
    proc.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
  });
};
