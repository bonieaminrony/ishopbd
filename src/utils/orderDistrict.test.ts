import { describe, it, expect } from 'vitest';
import { cleanLegacyDistrict } from './orderDistrict';
import { inferDeliveryArea } from '../components/admin/IncompleteOrderModal';

describe('cleanLegacyDistrict', () => {
  it('drops the made-up "Outside Dhaka" district', () => {
    expect(cleanLegacyDistrict('Outside Dhaka')).toBe('');
    expect(cleanLegacyDistrict(undefined)).toBe('');
  });
  it('keeps real districts', () => {
    expect(cleanLegacyDistrict(' Noakhali ')).toBe('Noakhali');
    expect(cleanLegacyDistrict('Dhaka')).toBe('Dhaka');
  });
});

describe('inferDeliveryArea', () => {
  it('prefers the saved delivery area', () => {
    expect(inferDeliveryArea({ deliveryArea: 'outside', district: 'Dhaka' }, '')).toBe('outside');
  });
  it('treats legacy "Outside Dhaka" as outside', () => {
    expect(inferDeliveryArea({ district: 'Outside Dhaka' }, 'Maijdee')).toBe('outside');
  });
});
