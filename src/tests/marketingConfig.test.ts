/**
 * Marketing Configuration & Meta CAPI Validation Tests
 */
import { describe, it, expect, vi } from 'vitest';
import {
  cleanSecretInput,
  resolveSecretUpdate,
  verifyMetaCapiConnection,
} from '../server/marketingRoutes';
import { buildMetaCapiPayload } from '../server/trackingEngine';

describe('Marketing Secret Token Sanitization & Preservation', () => {
  it('cleanSecretInput trims whitespace, newlines, and accidental surrounding quotes', () => {
    expect(cleanSecretInput('  EAAG1234567890  \n')).toBe('EAAG1234567890');
    expect(cleanSecretInput('"EAAG1234567890"')).toBe('EAAG1234567890');
    expect(cleanSecretInput("'  tt_token_abc  '")).toBe('tt_token_abc');
    expect(cleanSecretInput(null)).toBe('');
    expect(cleanSecretInput(undefined)).toBe('');
  });

  it('resolveSecretUpdate preserves stored token when incoming is empty or masked', () => {
    const existing = 'EAAG_REAL_LONG_SAVED_TOKEN_9988';
    expect(resolveSecretUpdate('', existing)).toBe(existing);
    expect(resolveSecretUpdate('   ', existing)).toBe(existing);
    expect(resolveSecretUpdate(undefined, existing)).toBe(existing);
    expect(resolveSecretUpdate('EAAG••••••••9988', existing)).toBe(existing);
  });

  it('resolveSecretUpdate replaces stored token cleanly and clears only when explicitly requested', () => {
    const existing = 'EAAG_OLD_TOKEN_1111';
    expect(resolveSecretUpdate('  "EAAG_NEW_TOKEN_2222"  ', existing)).toBe('EAAG_NEW_TOKEN_2222');
    expect(resolveSecretUpdate('', existing, true)).toBe('');
    expect(resolveSecretUpdate('EAAG••••••••1111', existing, true)).toBe('');
  });
});

describe('Meta CAPI Connection Verification', () => {
  it('returns error when pixelId is missing', async () => {
    const result = await verifyMetaCapiConnection({
      pixelId: '  ',
      accessToken: 'EAAG123456',
      buildMetaCapiPayload,
    });
    expect(result.success).toBe(false);
    expect(result.httpStatus).toBe(400);
  });

  it('returns browser-only warning when accessToken is empty', async () => {
    const result = await verifyMetaCapiConnection({
      pixelId: '1358996272808579',
      accessToken: '',
      buildMetaCapiPayload,
    });
    expect(result.success).toBe(true);
    expect(result.warning).toBe(true);
    expect(result.httpStatus).toBe(200);
  });

  it('succeeds via POST /events even when GET /{pixelId} fails with #200 permissions error', async () => {
    const getMock = vi.fn().mockRejectedValue({
      response: { data: { error: { code: 200, message: '(#200) Permissions error' } } },
    });
    const postMock = vi.fn().mockResolvedValue({
      data: { events_received: 1, fbtrace_id: 'trace_ok' },
    });

    const result = await verifyMetaCapiConnection({
      pixelId: '1358996272808579',
      accessToken: ' "EAAG_CAPI_ONLY_TOKEN_1234" ',
      testEventCode: 'TEST4242',
      clientIp: '103.10.20.30',
      userAgent: 'Vitest/1.0',
      buildMetaCapiPayload,
      httpClient: { get: getMock as any, post: postMock as any },
    });

    expect(result.success).toBe(true);
    expect(result.httpStatus).toBe(200);
    expect(result.message).toContain('TEST4242');
    expect(postMock).toHaveBeenCalledTimes(1);
    const [postUrl, postBody, postCfg] = postMock.mock.calls[0];
    expect(postUrl).toBe('https://graph.facebook.com/v19.0/1358996272808579/events');
    expect(postBody.test_event_code).toBe('TEST4242');
    expect(postCfg.params.access_token).toBe('EAAG_CAPI_ONLY_TOKEN_1234');
  });

  it('uses TEST_CONNECTION_CHECK fallback when testEventCode is blank', async () => {
    const getMock = vi.fn().mockResolvedValue({
      data: { id: '1358996272808579', name: 'iShop BD Pixel' },
    });
    const postMock = vi.fn().mockResolvedValue({
      data: { events_received: 1 },
    });

    const result = await verifyMetaCapiConnection({
      pixelId: '1358996272808579',
      accessToken: 'EAAG_VALID_TOKEN',
      testEventCode: '',
      buildMetaCapiPayload,
      httpClient: { get: getMock as any, post: postMock as any },
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('iShop BD Pixel');
    expect(result.message).toContain('TEST_CONNECTION_CHECK');
    expect(postMock.mock.calls[0][1].test_event_code).toBe('TEST_CONNECTION_CHECK');
  });

  it('fails cleanly when Meta /events returns events_received = 0', async () => {
    const getMock = vi.fn().mockResolvedValue({ data: { id: '1358996272808579' } });
    const postMock = vi.fn().mockResolvedValue({ data: { events_received: 0 } });

    const result = await verifyMetaCapiConnection({
      pixelId: '1358996272808579',
      accessToken: 'EAAG_VALID_TOKEN',
      buildMetaCapiPayload,
      httpClient: { get: getMock as any, post: postMock as any },
    });

    expect(result.success).toBe(false);
    expect(result.httpStatus).toBe(400);
  });

  it('includes Bengali token-invalidation hint on Meta error code 190', async () => {
    const getMock = vi.fn().mockRejectedValue(new Error('skipped'));
    const postMock = vi.fn().mockRejectedValue({
      response: {
        data: {
          error: {
            code: 190,
            message: 'Error validating access token: Session has expired or been invalidated.',
          },
        },
      },
    });

    const result = await verifyMetaCapiConnection({
      pixelId: '1358996272808579',
      accessToken: 'EAAG_OLD_TOKEN',
      buildMetaCapiPayload,
      httpClient: { get: getMock as any, post: postMock as any },
    });

    expect(result.success).toBe(false);
    expect(result.httpStatus).toBe(400);
    expect(result.error).toContain('নতুন Access Token জেনারেট করলে আগের টোকেন বাতিল হয়ে যায়');
  });
});
