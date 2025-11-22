import { planChunks } from '@common/chunker';

describe('planChunks', () => {
  it('returns single chunk when duration <= 50min', () => {
    const chunks = planChunks(60);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({ start: 0, end: 60, index: 0 });
  });

  it('splits long durations with overlap', () => {
    const chunks = planChunks(60 * 60); // 60 minutes
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((chunk, index) => {
      if (index > 0) {
        expect(chunk.start).toBe(chunks[index - 1].end - 30);
      }
    });
  });
});
