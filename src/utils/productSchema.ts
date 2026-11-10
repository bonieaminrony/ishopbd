export interface ProductSchemaInput {
  id: string;
  name: string;
  description: string;
  image: string | string[];
  url: string;
  brand?: string;
  mpn?: string;
  price: number;
  inStock: boolean;
  isFreeDelivery?: boolean;
  weight?: number;
  createdAt?: unknown;
  rating?: number;
  reviewCount?: number;
}

/**
 * Normalizes a Firestore timestamp, Date, or ISO string into YYYY-MM-DD format
 * for Schema.org Offer `validFrom`.
 */
export function formatSchemaDate(value: unknown, fallbackYear = new Date().getUTCFullYear()): string {
  const fallback = `${fallbackYear}-01-01`;
  if (!value) return fallback;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
    return fallback;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === 'object') {
    const maybeTs = value as { toDate?: () => Date; seconds?: number; _seconds?: number };
    if (typeof maybeTs.toDate === 'function') {
      const d = maybeTs.toDate();
      if (d instanceof Date && !Number.isNaN(d.getTime())) {
        return d.toISOString().slice(0, 10);
      }
    }
    const secs = typeof maybeTs.seconds === 'number' ? maybeTs.seconds : maybeTs._seconds;
    if (typeof secs === 'number' && Number.isFinite(secs)) {
      return new Date(secs * 1000).toISOString().slice(0, 10);
    }
  }

  return fallback;
}

/**
 * Computes the base shipping fee in BDT matching store policy (free delivery = 0,
 * otherwise inside-Dhaka weight-based starting tariff: 80 BDT up to 1kg + 20 BDT/extra kg).
 */
export function computeOfferShippingRateBdt(isFreeDelivery?: boolean, weight?: number): number {
  if (isFreeDelivery) return 0;
  const numericWeight = Number(weight || 0);
  if (!Number.isFinite(numericWeight) || numericWeight <= 1) {
    return 80;
  }
  return 80 + (Math.ceil(numericWeight) - 1) * 20;
}

/**
 * Builds Google Merchant Listing-compliant Schema.org Product JSON-LD,
 * including `validFrom`, `shippingDetails`, and `hasMerchantReturnPolicy` inside `offers`.
 */
export function buildProductStructuredData(input: ProductSchemaInput, now = new Date()): Record<string, any> {
  const currentYear = now.getUTCFullYear();
  const validFrom = formatSchemaDate(input.createdAt, currentYear);
  const priceValidUntil = `${currentYear + 1}-12-31`;
  const shippingRate = computeOfferShippingRateBdt(input.isFreeDelivery, input.weight);

  const schema: Record<string, any> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: input.name,
    image: input.image,
    description: input.description,
    sku: input.id,
    ...(input.mpn ? { mpn: input.mpn } : {}),
    brand: {
      '@type': 'Brand',
      name: input.brand || 'i SHOP BD',
    },
    offers: {
      '@type': 'Offer',
      url: input.url,
      priceCurrency: 'BDT',
      price: Number(input.price || 0),
      validFrom,
      priceValidUntil,
      availability: input.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'i SHOP BD',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: shippingRate,
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
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'BD',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
  };

  if (input.reviewCount && input.reviewCount > 0 && input.rating && input.rating > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(input.rating),
      reviewCount: Number(input.reviewCount),
    };
  }

  return schema;
}
