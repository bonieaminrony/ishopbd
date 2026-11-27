import React from 'react';
import { ShieldCheck, Truck, UserRound } from 'lucide-react';
import { Button, Field, OptionChip, OptionGroup, fieldClass } from './ui/ds';

/** Turns Bengali digits and +880 numbers into a plain 01XXXXXXXXX number. */
export function normalizeTypedPhone(raw: string): string {
  const bnDigits = '০১২৩৪৫৬৭৮৯';
  let text = String(raw || '').replace(/[০-৯]/g, (d) => String(bnDigits.indexOf(d)));
  const digits = text.replace(/\D/g, '');
  if (digits.startsWith('880')) return digits.length >= 13 ? '0' + digits.slice(3, 13) : digits;
  return digits.slice(0, 11);
}

type Area = 'inside' | 'outside';

interface Props {
  product: any;
  qty: number;
  color?: string;
  size?: string;
  getProductPrice: (product: any, qty: number) => number;
  getDeliveryCharge: (items: any[], area: string, coupon: any) => number;
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  area: Area;
  setArea: (v: Area) => void;
  savedProfiles: any[];
  selectSavedProfile: (profile: any, type: 'inline') => void;
  onSubmit: (e: React.FormEvent) => void;
  isProcessing: boolean;
  wholesaleMismatch: boolean;
}

export default function MobileInlineOrderForm(props: Props) {
  const {
    product, qty, color, size, getProductPrice, getDeliveryCharge,
    name, setName, phone, setPhone, address, setAddress, area, setArea,
    savedProfiles, selectSavedProfile, onSubmit, isProcessing, wholesaleMismatch,
  } = props;

  const [areaChosen, setAreaChosen] = React.useState(false);
  const [areaError, setAreaError] = React.useState(false);
  const areaRef = React.useRef<HTMLDivElement>(null);

  // A returning customer whose saved details are already filled in keeps their saved area.
  React.useEffect(() => {
    const first = savedProfiles?.[0];
    if (first?.area && (first.area === 'inside' || first.area === 'outside') && first.phone && first.phone === phone) {
      setArea(first.area);
      setAreaChosen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const money = (n: number) => `৳${Math.round(n).toLocaleString('en-IN')}`;
  const quantity = Math.max(1, Number(qty) || 1);
  const unitPrice = Number(getProductPrice(product, quantity)) || 0;
  const subtotal = unitPrice * quantity;
  const chargeFor = (a: Area) =>
    Number(getDeliveryCharge([{ product, quantity, color, size }], a, null)) || 0;
  const insideCharge = chargeFor('inside');
  const outsideCharge = chargeFor('outside');
  const delivery = areaChosen ? (area === 'inside' ? insideCharge : outsideCharge) : null;
  const total = subtotal + (delivery ?? 0);

  const otherProfiles = (Array.isArray(savedProfiles) ? savedProfiles : [])
    .filter((p) => p?.phone && p.phone !== phone)
    .slice(0, 2);

  const chooseArea = (a: Area) => {
    setArea(a);
    setAreaChosen(true);
    setAreaError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wholesaleMismatch) {
      alert('Please select the correct quantity for sizes/colors.');
      return;
    }
    const filled = name.trim() && phone.trim().length >= 11 && address.trim();
    if (filled && !areaChosen) {
      setAreaError(true);
      areaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onSubmit(e);
  };

  return (
    <section
      id="mobile-order-form"
      aria-labelledby="mobile-order-form-title"
      className="md:hidden mt-6 rounded-2xl border border-gray-200 bg-white"
    >
      <header className="px-4 pt-4">
        <h2 id="mobile-order-form-title" className="text-[16px] font-semibold text-secondary">
          অর্ডার করতে আপনার তথ্য দিন
        </h2>
        <p className="mt-0.5 text-[13px] text-gray-500">পণ্য হাতে পেয়ে টাকা দেবেন (ক্যাশ অন ডেলিভারি)</p>
      </header>

      <form onSubmit={handleSubmit} noValidate autoComplete="on" className="p-4 flex flex-col gap-4">
        {otherProfiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {otherProfiles.map((p) => (
              <button
                key={p.phone}
                type="button"
                onClick={() => {
                  selectSavedProfile(p, 'inline');
                  if (p.area === 'inside' || p.area === 'outside') { setAreaChosen(true); setAreaError(false); }
                }}
                className="inline-flex items-center gap-1.5 max-w-full h-9 rounded-full border border-gray-200 bg-white px-3.5 text-[13px] font-semibold text-gray-700 active:bg-gray-100"
              >
                <UserRound size={14} className="shrink-0 text-gray-500" />
                <span className="truncate">আগের তথ্য: {p.name ? `${p.name}, ` : ''}{p.phone}</span>
              </button>
            ))}
          </div>
        )}

        <Field label="আপনার নাম" htmlFor="inline-name-input">
          <input
            id="inline-name-input"
            name="name"
            type="text"
            autoComplete="name"
            enterKeyHint="next"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="যেমন: মোঃ রাকিব হাসান"
            className={fieldClass}
          />
        </Field>

        <Field label="মোবাইল নাম্বার" htmlFor="inline-phone-input">
          <input
            id="inline-phone-input"
            name="tel"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            enterKeyHint="next"
            value={phone}
            onChange={(e) => setPhone(normalizeTypedPhone(e.target.value))}
            placeholder="01XXXXXXXXX"
            className={`${fieldClass} tracking-wide`}
          />
        </Field>

        <Field label="সম্পূর্ণ ঠিকানা" htmlFor="inline-address-input">
          <textarea
            id="inline-address-input"
            name="street-address"
            autoComplete="street-address"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="বাসা/রোড, এলাকা, থানা, জেলা"
            className={`${fieldClass} h-auto py-3 resize-none leading-snug`}
          />
        </Field>

        <div ref={areaRef}>
          <OptionGroup
            title="ডেলিভারি"
            value={areaChosen ? (area === 'inside' ? 'ঢাকা সিটির ভেতরে' : 'ঢাকা সিটির বাইরে') : undefined}
            placeholder="কোথায় নেবেন?"
            error={areaError}
            layout="grid2"
          >
            {([
              ['inside', 'ঢাকা সিটির ভেতরে', insideCharge],
              ['outside', 'ঢাকা সিটির বাইরে', outsideCharge],
            ] as const).map(([value, label, charge]) => (
              <OptionChip
                key={value}
                selected={areaChosen && area === value}
                onClick={() => chooseArea(value)}
                className="py-2"
                sub={charge > 0 ? `ডেলিভারি ${money(charge)}` : 'ফ্রি ডেলিভারি'}
              >
                {label}
              </OptionChip>
            ))}
          </OptionGroup>
          {areaError && (
            <p className="mt-2 text-[12px] font-semibold text-primary">ঢাকার ভেতরে না বাইরে, একটা বেছে নিন</p>
          )}
        </div>

        <dl className="rounded-xl bg-gray-50 px-3.5 py-3 text-[14px]">
          <div className="flex justify-between text-gray-600">
            <dt>পণ্যের দাম{quantity > 1 ? ` (${quantity}টি)` : ''}</dt>
            <dd className="font-semibold text-gray-900">{money(subtotal)}</dd>
          </div>
          <div className="mt-1.5 flex justify-between text-gray-600">
            <dt>ডেলিভারি চার্জ</dt>
            <dd className="font-semibold text-gray-900">
              {delivery === null ? 'এরিয়া বাছুন' : delivery > 0 ? money(delivery) : 'ফ্রি'}
            </dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-gray-200 pt-2">
            <dt className="font-semibold text-gray-900">মোট</dt>
            <dd className="text-[16px] font-bold text-gray-900">{money(total)}</dd>
          </div>
        </dl>

        <Button type="submit" size="lg" block loading={isProcessing}>
          {isProcessing ? 'অর্ডার হচ্ছে...' : `অর্ডার কনফার্ম করুন · ${money(total)}`}
        </Button>

        <div className="flex items-center justify-center gap-4 text-[12px] font-medium text-gray-500">
          <span className="inline-flex items-center gap-1"><ShieldCheck size={13} /> অগ্রিম টাকা লাগবে না</span>
          <span className="inline-flex items-center gap-1"><Truck size={13} /> সারা দেশে ডেলিভারি</span>
        </div>
      </form>
    </section>
  );
}
