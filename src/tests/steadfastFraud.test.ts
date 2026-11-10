import { describe, it, expect } from 'vitest';

describe('Steadfast Fraud Check Data Processing', () => {
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
    const dirtyPhones = ['+8801700-000000', '01700 000 000', ' 01700000000 '];
    dirtyPhones.forEach(phone => {
      const clean = phone.replace(/[^0-9]/g, '');
      expect(clean.endsWith('01700000000')).toBe(true);
    });
  });
});
