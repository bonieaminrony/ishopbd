import { describe, it, expect } from 'vitest';
import {
  buildProductStructuredData,
  computeOfferShippingRateBdt,
  formatSchemaDate,
} from '../utils/productSchema';

describe('Product Structured Data (Google Merchant Listings)', () => {
  const fixedNow = new Date('2026-11-10T12:00:00Z');

  it('includes validFrom, shippingDetails, and hasMerchantReturnPolicy in offers', () => {
    const schema = buildProductStructuredData(
      {
        id: 'HN3TS6L5xUaBPS6q5E39',
        name: 'Ven-Dens 20000mAh Power Bank',
        description: 'Fast charging 20000mAh power bank',
        image: ['https://ishopbd.com/api/product-image/HN3TS6L5xUaBPS6q5E39'],
        url: 'https://ishopbd.com/p/ven-dens-20000-mah-power-bank-6q5E39',
        brand: 'Ven Dens',
        mpn: 'VD-PB059',
        price: 1550,
        inStock: true,
        isFreeDelivery: false,
        weight: 0.5,
        createdAt: '2026-08-08T15:22:57.388Z',
        rating: 5,
        reviewCount: 3,
      },
      fixedNow
    );

    expect(schema['@type']).toBe('Product');
    expect(schema.offers['@type']).toBe('Offer');
    expect(schema.offers.validFrom).toBe('2026-08-08');
    expect(schema.offers.priceValidUntil).toBe('2027-12-31');

    expect(schema.offers.shippingDetails).toEqual({
      '@type': 'OfferShippingDetails',
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: 80,
        currency: 'BDT',
      },
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: 'BD',
      },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: 0,
          maxValue: 1,
          unitCode: 'DAY',
        },
        transitTime: {
          '@type': 'QuantitativeValue',
          minValue: 1,
          maxValue: 3,
          unitCode: 'DAY',
        },
      },
    });

    expect(schema.offers.hasMerchantReturnPolicy).toEqual({
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'BD',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 7,
      returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/FreeReturn',
    });

    expect(schema.aggregateRating).toEqual({
      '@type': 'AggregateRating',
      ratingValue: 5,
      reviewCount: 3,
    });
  });

  it('sets shippingRate to 0 for free delivery and scales for heavier products', () => {
    expect(computeOfferShippingRateBdt(true, 3)).toBe(0);
    expect(computeOfferShippingRateBdt(false, 0)).toBe(80);
    expect(computeOfferShippingRateBdt(false, 1)).toBe(80);
    expect(computeOfferShippingRateBdt(false, 2.3)).toBe(120);
  });

  it('formats Firestore timestamps, Dates, and missing values safely for validFrom', () => {
    expect(formatSchemaDate({ seconds: 1786195377 }, 2026)).toBe('2026-08-08');
    expect(formatSchemaDate(new Date('2026-05-01T10:00:00Z'), 2026)).toBe('2026-05-01');
    expect(formatSchemaDate(undefined, 2026)).toBe('2026-01-01');
    expect(formatSchemaDate('not-a-date', 2026)).toBe('2026-01-01');
  });
});
