import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MarketingSettings } from '../components/MarketingSettings';

vi.mock('../utils/adminAuth', () => ({
  getAdminAuthHeaders: vi.fn().mockResolvedValue({ 'Content-Type': 'application/json' }),
}));

vi.mock('../utils/tracking', () => ({
  refreshTrackingConfig: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('MarketingSettings Pixel & Token Isolation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps Meta and TikTok token fields completely isolated with distinct input identities and save payloads', async () => {
    let savedPayload: any = null;
    const serverConfig = {
      meta: {
        enabled: true,
        pixelId: '111222333444',
        accessToken: '',
        hasAccessToken: false,
        maskedAccessToken: '',
        testEventCode: '',
        capiEnabled: true,
        clientPixelEnabled: true,
        attributionWindowDays: 7,
      },
      tiktok: {
        enabled: false,
        pixelId: '',
        accessToken: '',
        hasAccessToken: false,
        maskedAccessToken: '',
        testEventCode: '',
        eventsApiEnabled: true,
        clientPixelEnabled: true,
      },
      google: {
        enabled: false,
        ga4MeasurementId: '',
        adsConversionId: '',
        adsConversionLabel: '',
        enhancedConversions: true,
      },
      whatsapp: {
        enabled: true,
        phoneNumber: '8801700000000',
        defaultMessage: 'Hi',
      },
      imo: {
        enabled: true,
        campaignSource: 'imo',
        defaultMedium: 'social_chat',
      },
      openAi: {
        enabled: false,
        apiKey: '',
        hasApiKey: false,
        model: 'gpt-4o-mini',
      },
    };

    const fetchMock = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      const target = String(url);
      if (target.includes('/api/admin/marketing-config') && (!init?.method || init.method === 'GET')) {
        return {
          ok: true,
          json: async () => ({ success: true, config: serverConfig }),
        } as Response;
      }
      if (target.includes('/api/admin/marketing-config') && init?.method === 'POST') {
        savedPayload = JSON.parse(String(init.body || '{}'));
        return {
          ok: true,
          json: async () => ({ success: true }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({ success: true }),
      } as Response;
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<MarketingSettings />);

    // Wait for initial Meta panel load
    const metaTokenInput = (await screen.findByPlaceholderText(
      /EAAG\.\.\./i
    )) as HTMLInputElement;
    expect(metaTokenInput).toHaveAttribute('id', 'meta_capi_access_token');
    expect(metaTokenInput).toHaveAttribute('name', 'meta_capi_access_token');
    expect(metaTokenInput).toHaveAttribute('autocomplete', 'new-password');
    expect(metaTokenInput).toHaveAttribute('data-lpignore', 'true');

    // Type Meta CAPI Access Token
    fireEvent.change(metaTokenInput, { target: { value: 'EAAG-META-ONLY-TOKEN-123' } });
    expect(metaTokenInput.value).toBe('EAAG-META-ONLY-TOKEN-123');

    // Switch to TikTok Ads tab
    fireEvent.click(screen.getByRole('button', { name: /TikTok Ads/i }));

    const tiktokTokenInput = screen.getByPlaceholderText(
      /TikTok Events API Access Token/i
    ) as HTMLInputElement;
    expect(tiktokTokenInput).toHaveAttribute('id', 'tiktok_events_access_token');
    expect(tiktokTokenInput).toHaveAttribute('name', 'tiktok_events_access_token');
    expect(tiktokTokenInput).toHaveAttribute('autocomplete', 'new-password');
    // Crucial: switching tabs must NEVER leak Meta's token into TikTok's input
    expect(tiktokTokenInput.value).toBe('');

    const tiktokPixelInput = screen.getByPlaceholderText(/C1234567890ABCDEFG/i) as HTMLInputElement;
    expect(tiktokPixelInput).toHaveAttribute('id', 'tiktok-pixel-id');
    expect(tiktokPixelInput.value).toBe('');

    // Type TikTok Pixel ID and Token
    fireEvent.change(tiktokPixelInput, { target: { value: 'TT_PIXEL_999' } });
    fireEvent.change(tiktokTokenInput, { target: { value: 'TIKTOK-ONLY-SECRET-999' } });
    expect(tiktokTokenInput.value).toBe('TIKTOK-ONLY-SECRET-999');

    // Switch back to Meta tab -> Meta token & Pixel must still be intact and untouched
    fireEvent.click(screen.getByRole('button', { name: /Meta \(FB & IG\)/i }));
    const metaTokenAfterReturn = screen.getByPlaceholderText(/EAAG\.\.\./i) as HTMLInputElement;
    const metaPixelAfterReturn = screen.getByPlaceholderText(/1358996272808579/i) as HTMLInputElement;
    expect(metaTokenAfterReturn.value).toBe('EAAG-META-ONLY-TOKEN-123');
    expect(metaPixelAfterReturn.value).toBe('111222333444');

    // Save config -> POST payload must preserve both tokens independently
    fireEvent.click(screen.getByRole('button', { name: /সেটিংস সংরক্ষণ করুন/i }));
    await waitFor(() => {
      expect(savedPayload).not.toBeNull();
    });
    expect(savedPayload.meta.accessToken).toBe('EAAG-META-ONLY-TOKEN-123');
    expect(savedPayload.meta.pixelId).toBe('111222333444');
    expect(savedPayload.tiktok.accessToken).toBe('TIKTOK-ONLY-SECRET-999');
    expect(savedPayload.tiktok.pixelId).toBe('TT_PIXEL_999');
  });
});
