/**
 * Old website orders stored a made-up district when the customer never picked one
 * ("Outside Dhaka"). It is not a real district, so edit forms show it as empty.
 */
export function cleanLegacyDistrict(value: unknown): string {
  const text = String(value ?? '').trim();
  if (!text) return '';
  if (text.toLowerCase() === 'outside dhaka') return '';
  return text;
}
