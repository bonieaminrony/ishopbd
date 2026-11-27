import { describe, it, expect } from 'vitest';
import { normalizeTypedPhone } from './MobileInlineOrderForm';

describe('normalizeTypedPhone', () => {
  it('turns autofilled +880 numbers into 01XXXXXXXXX', () => {
    expect(normalizeTypedPhone('+880 1712-345678')).toBe('01712345678');
    expect(normalizeTypedPhone('8801712345678')).toBe('01712345678');
  });
  it('converts Bengali digits and drops spaces', () => {
    expect(normalizeTypedPhone('০১৭১২ ৩৪৫৬৭৮')).toBe('01712345678');
  });
  it('caps a local number at 11 digits', () => {
    expect(normalizeTypedPhone('017123456789')).toBe('01712345678');
  });
  it('keeps a partly typed +880 number', () => {
    expect(normalizeTypedPhone('+8801')).toBe('8801');
  });
});
