import { serializeScenes } from '@common/scenes';

describe('serializeScenes', () => {
  it('rounds numeric fields for stable output', () => {
    const json = serializeScenes([
      { start: 30.12345, end: 42.98765, score: 0.98765, reason: 'test' },
    ]);
    expect(json).toContain('30.123');
    expect(json).toContain('42.988');
    expect(json).toContain('0.9877');
  });
});
