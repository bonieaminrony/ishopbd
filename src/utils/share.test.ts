import { describe, it, expect, vi, afterEach } from 'vitest';
import { shareLink } from './share';

const data = { title: 'Power Bank', url: 'https://ishopbd.com/p/power-bank' };

afterEach(() => { vi.unstubAllGlobals(); });

describe('shareLink', () => {
  it('uses the phone share sheet when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { share });
    expect(await shareLink(data)).toBe('shared');
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ url: data.url }));
  });
  it('reports a cancelled share sheet without copying', async () => {
    const writeText = vi.fn();
    vi.stubGlobal('navigator', { share: vi.fn().mockRejectedValue(Object.assign(new Error('x'), { name: 'AbortError' })), clipboard: { writeText } });
    expect(await shareLink(data)).toBe('cancelled');
    expect(writeText).not.toHaveBeenCalled();
  });
  it('copies the link when there is no share sheet', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    expect(await shareLink(data)).toBe('copied');
    expect(writeText).toHaveBeenCalledWith(data.url);
  });
});
