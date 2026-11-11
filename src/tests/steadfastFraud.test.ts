import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  clearSteadfastFraudMemoryCache,
  fetchSteadfastFraudBatch,
  getSteadfastFraudReportCached,
  parseSteadfastFraudPayload,
} from '../server/courierSyncEngine';
import {
  getCourierReportForPhone,
  normalizeBdPhone,
  parseClientCourierFraudReport,
} from '../utils/courierDisplay';

describe('Steadfast Fraud Check Data Processing', () => {
  beforeEach(() => {
    clearSteadfastFraudMemoryCache();
    vi.restoreAllMocks();
  });
  it('correctly processes live Steadfast score endpoint response format', () => {
    const rawSteadfastScoreResponse = {
      status: 200,
      phone: '01700000000',
      score: null,
      level: null,
      reasons: [],
      scoring_disabled: true,
      doubtful_reports: false,
      total_reports: 19,
      delivery_ratio: 35,
      cancellation_ratio: 64,
      volume_band: 'high',
      fraud_categories: [],
      return_ratio: 64
    };

    const delivery_rate = rawSteadfastScoreResponse.delivery_ratio !== null ? rawSteadfastScoreResponse.delivery_ratio : 0;
    const cancellation_rate = rawSteadfastScoreResponse.cancellation_ratio !== null ? rawSteadfastScoreResponse.cancellation_ratio : 0;
    const total_fraud_report = rawSteadfastScoreResponse.total_reports;
    const isRisky = cancellation_rate > 40;
    const isFraud = total_fraud_report > 0;

    expect(delivery_rate).toBe(35);
    expect(cancellation_rate).toBe(64);
    expect(total_fraud_report).toBe(19);
    expect(isRisky).toBe(true);
    expect(isFraud).toBe(true);
  });

  it('correctly processes legacy Steadfast parcel count format', () => {
    const rawLegacyResponse = {
      status: 200,
      total_parcel: 20,
      total_delivered: 18,
      total_cancelled: 2,
      total_fraud_report: 0
    };

    const total_parcel = rawLegacyResponse.total_parcel;
    const total_delivered = rawLegacyResponse.total_delivered;
    const total_cancelled = rawLegacyResponse.total_cancelled;
    const delivery_rate = total_parcel > 0 ? Math.round((total_delivered / total_parcel) * 100) : 0;
    const cancellation_rate = total_parcel > 0 ? Math.round((total_cancelled / total_parcel) * 100) : 0;
    const isFraud = rawLegacyResponse.total_fraud_report > 0;

    expect(delivery_rate).toBe(90);
    expect(cancellation_rate).toBe(10);
    expect(isFraud).toBe(false);
  });

  it('handles clean phone number extraction with special characters', () => {
    const dirtyPhones = ['+8801700-000000', '01700 000 000', ' 01700000000 ', '০১৭০০-০০০০০০'];
    dirtyPhones.forEach((phone) => {
      expect(normalizeBdPhone(phone)).toBe('01700000000');
    });

    const map = { '01738364268': { delivery_rate: 97 } };
    expect(getCourierReportForPhone(map, '+8801738364268')?.delivery_rate).toBe(97);
    expect(getCourierReportForPhone(map, '8801738364268')?.delivery_rate).toBe(97);
  });

  it('parses Steadfast score payload including volume_range on server and client', () => {
    const rawScore = {
      status: 200,
      phone: '01738364268',
      total_reports: 0,
      delivery_ratio: 97,
      cancellation_ratio: 2,
      volume_band: 'high',
      volume_range: '25+',
    };

    const serverParsed = parseSteadfastFraudPayload('01738364268', rawScore);
    expect(serverParsed.delivery_rate).toBe(97);
    expect(serverParsed.cancellation_rate).toBe(2);
    expect(serverParsed.volume_band).toBe('high');
    expect(serverParsed.volume_range).toBe('25+');

    const clientParsed = parseClientCourierFraudReport({ success: true, data: serverParsed });
    expect(clientParsed?.delivery_rate).toBe(97);
    expect(clientParsed?.cancellation_rate).toBe(2);
    expect(clientParsed?.volume_range).toBe('25+');
  });

  it('caches Steadfast fraud lookups in memory and supports forceRefresh + deduplicated batching', async () => {
    process.env.STEADFAST_API_KEY = 'test-key';
    process.env.STEADFAST_SECRET_KEY = 'test-secret';

    const getSpy = vi.spyOn(axios, 'get').mockImplementation(async (url: string) => {
      const phone = url.split('/').pop() || '';
      return {
        data: {
          status: 200,
          phone,
          delivery_ratio: 91,
          cancellation_ratio: 9,
          total_reports: 0,
          volume_band: 'medium',
          volume_range: '10-24',
        },
      } as any;
    });

    const first = await getSteadfastFraudReportCached('+8801711000001');
    expect(first.fromCache).toBe(false);
    expect(first.data.phone).toBe('01711000001');
    expect(first.data.volume_range).toBe('10-24');
    expect(getSpy).toHaveBeenCalledTimes(1);

    // Second call uses cache without hitting upstream API
    const second = await getSteadfastFraudReportCached('01711000001');
    expect(second.fromCache).toBe(true);
    expect(getSpy).toHaveBeenCalledTimes(1);

    // Force refresh bypasses cache
    const refreshed = await getSteadfastFraudReportCached('01711000001', { forceRefresh: true });
    expect(refreshed.fromCache).toBe(false);
    expect(getSpy).toHaveBeenCalledTimes(2);

    // Batch deduplicates + caps at 15 and serves cached phones without extra API calls
    const batch = await fetchSteadfastFraudBatch([
      '01711000001',
      '+8801711000001',
      '01711000002',
    ]);
    expect(batch.cachedPhones).toEqual(['01711000001']);
    expect(batch.fetchedPhones).toEqual(['01711000002']);
    expect(batch.results['01711000002'].delivery_rate).toBe(91);
    expect(getSpy).toHaveBeenCalledTimes(3);
  });
});
