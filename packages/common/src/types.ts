import { Scene } from './scenes.js';

export interface IngestJob {
  videoId: string;
}

export interface AnalyzeJob {
  videoId: string;
  chunkPath: string;
  chunkIndex: number;
}

export interface ClipJob {
  videoId: string;
  chunkPath: string;
  scene: Scene;
  outBase: string;
}

export interface PublishJob {
  file: string;
  caption: string;
}
