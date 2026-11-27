/**
 * iShopBD storefront design system.
 *
 * Every new storefront page, tab, window or form is built from these parts so the
 * whole site looks like one product. Rules live in DESIGN_SYSTEM.md at the project root.
 *
 * Scale (do not invent new values):
 *   control height  44px (h-11)   main action 48px (h-12)
 *   radius          controls 12px (rounded-xl)   cards / windows 16px (rounded-2xl)
 *   spacing         inside a card 16px (p-4)     between sections 20px (gap-5 / mt-5)
 *   text            section title 16px semibold  label 13px semibold  body 14px  small 12px
 *   colour          primary red = actions + price   navy (secondary) = titles
 *                   gray-200 borders   white surfaces   no shadows except the main action
 */
import React from 'react';
import { Check, Loader2 } from 'lucide-react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

/* ------------------------------------------------------------------ Button */

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'md' | 'lg';

export type ButtonProps = React.ComponentProps<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
};

const buttonVariant: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20 disabled:shadow-none',
  secondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 active:bg-gray-100',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
};
const buttonSize: Record<ButtonSize, string> = {
  md: 'h-11 px-4 text-[14px]',
  lg: 'h-12 px-5 text-[15px]',
};

export function Button({
  variant = 'primary', size = 'md', block, loading, icon, className, children, disabled, type = 'button', ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors select-none touch-manipulation',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 disabled:cursor-not-allowed',
        buttonVariant[variant], buttonSize[size], block && 'w-full', className,
      )}
      {...rest}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------- PillButton */

/** Small rounded action next to a title: Share, Save, Size guide. */
export function PillButton({
  active, icon, className, children, type = 'button', ...rest
}: React.ComponentProps<'button'> & { active?: boolean; icon?: React.ReactNode }) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cx(
        'inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-[13px] font-semibold transition-colors touch-manipulation',
        active ? 'border-primary/30 bg-primary/5 text-primary' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------- OptionChip */

/** One choice in a group (colour, size, delivery area). Same look everywhere. */
export function OptionChip({
  selected, image, sub, className, children, type = 'button', ...rest
}: React.ComponentProps<'button'> & { selected?: boolean; image?: string; sub?: React.ReactNode }) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cx(
        'relative inline-flex items-center justify-center gap-2 min-h-11 rounded-xl border text-[14px] font-semibold transition-colors select-none touch-manipulation',
        image ? 'pl-1.5 pr-3.5 py-1' : 'px-4 py-1.5',
        selected
          ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
          : 'border-gray-200 bg-white text-gray-800 hover:border-gray-400 active:bg-gray-50',
        className,
      )}
      {...rest}
    >
      {image && <img src={image} alt="" loading="lazy" decoding="async" className="w-8 h-8 rounded-lg object-cover bg-white border border-gray-100" />}
      <span className="flex flex-col items-center leading-tight">
        <span>{children}</span>
        {sub && <span className={cx('text-[12px] font-medium', selected ? 'text-primary' : 'text-gray-500')}>{sub}</span>}
      </span>
      {selected && !sub && <Check size={14} strokeWidth={3} className="shrink-0" />}
    </button>
  );
}

/* ------------------------------------------------------------- OptionGroup */

/** Title row + chips. `value` shows what is chosen next to the title. */
export function OptionGroup({
  id, title, value, placeholder, action, error, layout = 'wrap', children,
}: {
  id?: string;
  title: React.ReactNode;
  value?: React.ReactNode;
  placeholder?: React.ReactNode;
  action?: React.ReactNode;
  error?: boolean;
  layout?: 'wrap' | 'grid4' | 'grid2';
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 mb-2 min-h-6">
        <p className="text-[14px] font-semibold text-gray-900 truncate">
          {title}:{' '}
          <span className={value ? 'text-gray-900' : 'font-normal text-gray-500'}>{value || placeholder}</span>
        </p>
        {action}
      </div>
      <div
        id={id}
        className={cx(
          'rounded-xl transition-shadow',
          layout === 'wrap' && 'flex flex-wrap gap-2',
          layout === 'grid4' && 'grid grid-cols-4 sm:flex sm:flex-wrap gap-2',
          layout === 'grid2' && 'grid grid-cols-2 gap-2',
          error && 'ring-2 ring-primary ring-offset-4 ring-offset-white',
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- Field */

export const fieldClass =
  'w-full h-12 px-3.5 text-[15px] font-medium text-gray-900 bg-white border border-gray-300 rounded-xl outline-none transition-colors placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/15';

export function Field({
  label, htmlFor, hint, children,
}: { label: React.ReactNode; htmlFor?: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="w-full">
      <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[12px] text-gray-500">{hint}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------- Card */

export function Card({
  title, subtitle, action, className, bodyClassName, children, as: Tag = 'section', ...rest
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
  as?: 'section' | 'div';
} & Omit<React.ComponentProps<'section'>, 'title'>) {
  return (
    <Tag className={cx('rounded-2xl border border-gray-200 bg-white', className)} {...rest}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 px-4 pt-4">
          <div className="min-w-0">
            {title && <h2 className="text-[16px] font-semibold text-secondary leading-snug">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-[13px] text-gray-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cx('p-4', bodyClassName)}>{children}</div>
    </Tag>
  );
}

/* -------------------------------------------------------------------- Tabs */

export interface TabItem { id: string; label: React.ReactNode; count?: number }

/** Pill tabs; the row scrolls sideways on phones instead of wrapping into two lines. */
export function Tabs({
  items, value, onChange, className,
}: { items: TabItem[]; value: string; onChange: (id: string) => void; className?: string }) {
  return (
    <div role="tablist" className={cx('flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0', className)}>
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cx(
              'shrink-0 whitespace-nowrap h-10 px-4 rounded-full text-[14px] font-semibold transition-colors touch-manipulation',
              active ? 'bg-secondary text-white border border-secondary' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
            )}
          >
            {item.label}
            {typeof item.count === 'number' && item.count > 0 && (
              <span className={cx('ml-1.5 text-[12px] font-bold', active ? 'text-white/70' : 'text-gray-500')}>{item.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------- ProductThumb */

/** Square white frame so every product photo has the same size and padding. */
export function ProductThumb({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  return (
    <div className={cx('relative aspect-square w-full overflow-hidden bg-white', className)}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-contain p-2" />
      ) : (
        <div className="absolute inset-0 bg-gray-50" />
      )}
    </div>
  );
}

/* -------------------------------------------------------- MiniProductCard */

export function MiniProductCard({
  href, image, name, price, oldPrice, discount, onOpen,
}: {
  key?: React.Key; href: string; image?: string; name: string; price: number; oldPrice?: number; discount?: number;
  onOpen?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const money = (n: number) => `৳${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;
  return (
    <a
      href={href}
      onClick={onOpen}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-colors hover:border-gray-300 active:bg-gray-50"
    >
      <div className="relative border-b border-gray-100">
        <ProductThumb src={image} alt={name} />
        {discount && discount > 0 ? (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-white">-{discount}%</span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 min-h-[2.6em] text-[13px] font-medium leading-[1.3] text-gray-800">{name}</h3>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-[15px] font-bold text-primary">{money(price)}</span>
          {oldPrice && oldPrice > price ? <span className="text-[12px] text-gray-400 line-through">{money(oldPrice)}</span> : null}
        </div>
      </div>
    </a>
  );
}

/* ------------------------------------------------------------ RatingStars */

export function RatingStars({ rating = 0, count = 0, onClick }: { rating?: number; count?: number; onClick?: () => void }) {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 h-9 text-[13px] font-semibold text-gray-700">
      <span className="relative inline-block text-[15px] leading-none tracking-[1px]" aria-hidden>
        <span className="text-gray-300">★★★★★</span>
        <span className="absolute inset-0 overflow-hidden text-amber-500" style={{ width: `${(r / 5) * 100}%` }}>★★★★★</span>
      </span>
      <span>{r > 0 ? r.toFixed(1) : ''}</span>
      <span className="font-normal text-gray-500">({count})</span>
      <span className="sr-only">ratings</span>
    </button>
  );
}
