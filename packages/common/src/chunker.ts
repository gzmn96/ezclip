export interface ChunkPlan {
  start: number;
  end: number;
  index: number;
}

export const planChunks = (duration: number, maxLength = 15 * 60, overlap = 30): ChunkPlan[] => {
  if (duration <= 0) {
    return [];
  }

  if (duration <= 50 * 60) {
    return [{ start: 0, end: duration, index: 0 }];
  }

  const chunks: ChunkPlan[] = [];
  let start = 0;
  let index = 0;

  while (start < duration) {
    const end = Math.min(start + maxLength, duration);
    chunks.push({ start, end, index });
    if (end === duration) {
      break;
    }
    start = end - overlap;
    index += 1;
  }

  return chunks;
};
