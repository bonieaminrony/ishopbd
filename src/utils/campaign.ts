/**
 * Campaigns: a named set of products with its own link, /campaign/<slug>, for ads and offers.
 */

/** Lower-case letters, digits and dashes only (what the link can contain). */
export function normalizeCampaignSlug(input: unknown): string {
  return String(input ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

/** A link name from the campaign name; Bengali-only names (no Latin letters) get "offer-xxxx". */
export function suggestCampaignSlug(name: unknown, random: () => number = Math.random): string {
  const fromName = normalizeCampaignSlug(name);
  if (fromName) return fromName;
  return `offer-${Math.floor(random() * 36 ** 4).toString(36).padStart(4, '0')}`;
}

export function campaignLink(slug: string, origin = typeof window !== 'undefined' ? window.location.origin : 'https://ishopbd.com'): string {
  return `${origin}/campaign/${encodeURIComponent(slug)}`;
}

export type CampaignDraft = {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  productIds?: string[];
  isActive?: boolean;
  createdAt?: string;
};

export type PreparedCampaign =
  | { ok: true; data: { name: string; slug: string; description: string; image: string; productIds: string[]; isActive: boolean; updatedAt: string } }
  | { ok: false; error: string };

/** Checks a campaign before saving and returns exactly the fields to store. */
export function prepareCampaignForSave(draft: CampaignDraft | null | undefined, existing: CampaignDraft[] = []): PreparedCampaign {
  const name = String(draft?.name ?? '').trim();
  if (!name) return { ok: false, error: 'ক্যাম্পেইনের নাম দিন' };
  if (name.length > 200) return { ok: false, error: 'নাম ২০০ অক্ষরের মধ্যে রাখুন' };

  const slug = normalizeCampaignSlug(draft?.slug) || suggestCampaignSlug(name);
  const taken = existing.some((c) => c && c.id !== draft?.id && normalizeCampaignSlug(c.slug) === slug);
  if (taken) return { ok: false, error: `"${slug}" লিংকটি আরেকটি ক্যাম্পেইনে আছে, অন্য একটি দিন` };

  const productIds = Array.from(new Set((draft?.productIds || []).filter((id) => typeof id === 'string' && id)));
  if (productIds.length === 0) return { ok: false, error: 'অন্তত একটি পণ্য বাছাই করুন' };

  return {
    ok: true,
    data: {
      name,
      slug,
      description: String(draft?.description ?? '').trim().slice(0, 500),
      image: String(draft?.image ?? ''),
      productIds,
      isActive: draft?.isActive !== false,
      updatedAt: new Date().toISOString(),
    },
  };
}
