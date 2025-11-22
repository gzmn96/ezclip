import { buildFilters } from '@common/ffmpeg';

describe('buildFilters', () => {
  it('builds vertical filters', () => {
    expect(buildFilters('9:16')).toBe('scale=1080:-2,crop=1080:1920');
  });

  it('builds square filters', () => {
    expect(buildFilters('1:1')).toBe('scale=1080:-2,crop=1080:1080');
  });
});
