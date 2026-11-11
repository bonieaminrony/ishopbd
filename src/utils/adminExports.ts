import toast from 'react-hot-toast';
import { getOrderItemsSafe, resolveCourierBadgeDisplay } from './courierDisplay';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const CODE39_MAP: Record<string, string> = {
  '0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn',
  '4': 'nnnwwnnnw', '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw',
  '8': 'wnnwnnwnn', '9': 'nnwwnnwnn', 'A': 'wnnnnwnnw', 'B': 'nnwnnwnnw',
  'C': 'wnwnnwnnn', 'D': 'nnnnwwnnw', 'E': 'wnnnwwnnn', 'F': 'nnwnwwnnn',
  'G': 'nnnnnwwnw', 'H': 'wnnnnwwnn', 'I': 'nnwnnwwnn', 'J': 'nnnnwwwnn',
  'K': 'wnnnnnnww', 'L': 'nnwnnnnww', 'M': 'wnwnnnnwn', 'N': 'nnnnwnnww',
  'O': 'wnnnwnnwn', 'P': 'nnwnwnnwn', 'Q': 'nnnnnnwww', 'R': 'wnnnnnwwn',
  'S': 'nnwnnnwwn', 'T': 'nnnnwnwwn', 'U': 'wwnnnnnnw', 'V': 'nwwnnnnnw',
  'W': 'wwwnnnnnn', 'X': 'nwnnwnnnw', 'Y': 'wwnnwnnnn', 'Z': 'nwwnwnnnn',
  '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn', '$': 'nwnwnwnnn',
  '/': 'nwnwnnnwn', '+': 'nwnnnwnwn', '%': 'nnnwnwnwn', '*': 'nwnnwnwnn',
};

export function renderCode39BarcodeSvg(rawValue: string): string {
  const cleaned = String(rawValue || '')
    .toUpperCase()
    .replace(/[^0-9A-Z\-. $/+%]/g, '');
  if (!cleaned) return '';

  const encoded = `*${cleaned}*`;
  const narrow = 1.4;
  const wide = 3.6;
  const height = 28;
  let x = 0;
  const rects: string[] = [];

  for (let c = 0; c < encoded.length; c++) {
    const pattern = CODE39_MAP[encoded[c]];
    if (!pattern) continue;
    for (let i = 0; i < pattern.length; i++) {
      const w = pattern[i] === 'w' ? wide : narrow;
      if (i % 2 === 0) {
        rects.push(`<rect x="${x.toFixed(1)}" y="0" width="${w.toFixed(1)}" height="${height}" fill="#111827" />`);
      }
      x += w;
    }
    x += narrow;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(x)} ${height}" preserveAspectRatio="none" style="width:100%;max-width:190px;height:26px;display:block;">${rects.join('')}</svg>`;
}

export interface BulkStickerOptions {
  shopName?: string;
  logoUrl?: string;
  baseUrl?: string;
  layout?: 'a4-4' | 'a4-6' | 'thermal';
  showPrice?: boolean;
}

function cleanVariantAttr(value: unknown): string {
  const s = String(value ?? '').trim();
  if (!s || s.toUpperCase() === 'N/A' || s.toLowerCase() === 'none') return '';
  return s;
}

export function buildBulkOrderStickersHtml(orders: any[], options: BulkStickerOptions = {}): string {
  const safeOrders = Array.isArray(orders) ? orders.filter(Boolean) : [];
  const shopName = (options.shopName || 'i SHOP BD').trim() || 'i SHOP BD';
  const baseUrl = (options.baseUrl || '').replace(/\/+$/, '');
  const rawLogo = (options.logoUrl || '/logo.png').trim() || '/logo.png';
  const resolvedLogo =
    rawLogo.startsWith('http://') || rawLogo.startsWith('https://') || rawLogo.startsWith('data:')
      ? rawLogo
      : `${baseUrl}${rawLogo.startsWith('/') ? '' : '/'}${rawLogo}`;

  const defaultLayout = options.layout || 'thermal';
  const showPriceClass = options.showPrice ? ' show-prices' : '';

  const stickerCardsHtml = safeOrders
    .map((order) => {
      const shortOrderId = String(order.displayId || order.id || '')
        .slice(-6)
        .toUpperCase();
      const consignmentId = String(order.courierConsignmentId || '').trim();
      const trackingId = String(order.courierTrackingId || '').trim();
      const courierMeta = resolveCourierBadgeDisplay({
        isDispatched: Boolean(consignmentId || trackingId || order.courierStatus),
        courierStatus: order.courierStatus,
        courierStatusNormalized: order.courierStatusNormalized,
        courierStatusLabel: order.courierStatusLabel,
        courierHub: order.courierHub,
        courierTrackingMessage: order.courierTrackingMessage,
      });

      const courierService = String(order.courierName || '').trim() || (consignmentId || trackingId ? 'Steadfast' : 'Courier Pending');
      const primaryScanCode = consignmentId || trackingId || shortOrderId;
      const barcodeSvg = renderCode39BarcodeSvg(primaryScanCode);

      const items = getOrderItemsSafe(order);
      const itemsHtml =
        items.length > 0
          ? items
              .map((item: any, idx: number) => {
                const prodName = String(item?.product?.name || item?.name || 'Item').trim();
                const qty = Math.max(1, Number(item?.quantity) || 1);
                const size = cleanVariantAttr(item?.size);
                const color = cleanVariantAttr(item?.color);
                const variantName = cleanVariantAttr(item?.variantName || item?.variant);

                const attrParts: string[] = [];
                if (size) attrParts.push(`<span class="attr-pill">Size: ${escapeHtml(size)}</span>`);
                if (color) attrParts.push(`<span class="attr-pill">Color: ${escapeHtml(color)}</span>`);
                if (variantName && !attrParts.length) {
                  attrParts.push(`<span class="attr-pill">${escapeHtml(variantName)}</span>`);
                }

                return `
                  <div class="item-row">
                    <div class="item-main">
                      <span class="item-idx">${idx + 1}.</span>
                      <div class="item-info">
                        <div class="item-name">${escapeHtml(prodName)}</div>
                        ${attrParts.length > 0 ? `<div class="item-attrs">${attrParts.join(' ')}</div>` : ''}
                      </div>
                    </div>
                    <span class="item-qty">×${qty} pcs</span>
                  </div>
                `;
              })
              .join('')
          : '<div class="item-row"><span class="item-name">No product details</span></div>';

      const cleanAddress =
        order.address && String(order.address).trim() !== '' && order.address !== 'N/A'
          ? String(order.address).split(' - (')[0].trim()
          : 'No address provided';

      const areaLabel = order.deliveryArea === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka';
      const totalAmount = Number(order.codAmount !== undefined ? order.codAmount : order.total || 0) || 0;

      return `
        <article class="sticker-card">
          <div class="sticker-header">
            <div class="shop-brand">
              <img src="${escapeHtml(resolvedLogo)}" alt="${escapeHtml(shopName)}" class="shop-logo" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';" />
              <div class="shop-name-fallback">${escapeHtml(shopName)}</div>
              <div class="shop-sub">PARCEL SHIPPING LABEL</div>
            </div>
            <div class="order-meta">
              <div class="order-id">ORDER #${escapeHtml(shortOrderId)}</div>
              ${order.date ? `<div class="order-date">${escapeHtml(order.date)}</div>` : ''}
            </div>
          </div>

          <div class="courier-box">
            <div class="courier-top">
              <div>
                <span class="courier-name">${escapeHtml(courierService)}</span>
                <span class="courier-status">${escapeHtml(courierMeta.isNotBooked ? 'NOT BOOKED' : courierMeta.badgeText)}</span>
              </div>
              <span class="area-pill">${escapeHtml(areaLabel)}</span>
            </div>
            <div class="tracking-grid">
              ${
                consignmentId
                  ? `<div class="track-line"><span>CID:</span> <strong>#${escapeHtml(consignmentId)}</strong></div>`
                  : ''
              }
              ${
                trackingId
                  ? `<div class="track-line"><span>Tracking:</span> <strong class="mono">${escapeHtml(trackingId)}</strong></div>`
                  : ''
              }
              ${
                !consignmentId && !trackingId
                  ? `<div class="track-line"><span>Order Ref:</span> <strong class="mono">#${escapeHtml(shortOrderId)}</strong></div>`
                  : ''
              }
            </div>
            ${barcodeSvg ? `<div class="barcode-wrap">${barcodeSvg}</div>` : ''}
          </div>

          <div class="customer-box">
            <div class="box-label">TO / গ্রাহকের তথ্য</div>
            <div class="customer-top">
              <span class="customer-name">${escapeHtml(order.customerName || 'Customer')}</span>
              <span class="customer-phone">${escapeHtml(order.customerPhone || '')}</span>
            </div>
            <div class="customer-addr">${escapeHtml(cleanAddress)}</div>
          </div>

          <div class="items-box">
            <div class="box-label">PRODUCTS / পণ্যের তালিকা (${items.length})</div>
            <div class="items-list">${itemsHtml}</div>
          </div>

          <div class="sticker-price-block">
            <span>COD / Payable Total:</span>
            <strong>৳${totalAmount.toLocaleString('en-IN')}</strong>
          </div>
        </article>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <title>Shipping Stickers (${safeOrders.length}) - ${escapeHtml(shopName)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      padding: 16px;
    }
    .toolbar {
      max-width: 960px;
      margin: 0 auto 16px auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 12px 16px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
    }
    .toolbar-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .count-badge {
      background: #0f172a; color: #fff; font-weight: 800; font-size: 12px;
      padding: 4px 10px; border-radius: 999px;
    }
    .toolbar-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .select-layout, .toggle-label {
      font-size: 12px; font-weight: 700; color: #334155;
      background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px 10px;
      cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
    }
    .print-btn {
      background: #e11d48; color: #fff; border: none; border-radius: 10px;
      padding: 8px 16px; font-size: 13px; font-weight: 800; cursor: pointer;
    }
    .print-btn:hover { background: #be123c; }

    .stickers-sheet {
      max-width: 960px;
      margin: 0 auto;
      display: grid;
      gap: 12px;
    }
    .stickers-sheet.layout-a4-4 { grid-template-columns: repeat(2, 95mm); justify-content: center; gap: 6mm; }
    .stickers-sheet.layout-a4-6 { grid-template-columns: repeat(2, 95mm); justify-content: center; gap: 4mm; }
    .stickers-sheet.layout-thermal { max-width: 100mm; grid-template-columns: 96mm; justify-content: center; gap: 14px; }

    .sticker-card {
      background: #ffffff;
      border: 1.5px dashed #64748b;
      border-radius: 8px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 6px;
      min-height: 132mm;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .layout-a4-6 .sticker-card { min-height: 88mm; padding: 7px 9px; gap: 4px; }
    .layout-thermal .sticker-card {
      width: 96mm;
      min-height: 142mm;
      border: 1.5px solid #0f172a;
      page-break-after: always;
      break-after: page;
    }

    .sticker-header {
      display: flex; justify-content: space-between; align-items: center;
      border-bottom: 1.5px solid #e2e8f0; padding-bottom: 6px; gap: 8px;
    }
    .shop-brand { display: flex; flex-direction: column; align-items: flex-start; gap: 3px; min-width: 0; }
    .shop-logo { height: 28px; width: auto; max-width: 140px; object-fit: contain; display: block; }
    .shop-name-fallback { display: none; font-size: 13px; font-weight: 900; color: #0f172a; line-height: 1.1; }
    .shop-sub { font-size: 8px; font-weight: 800; color: #64748b; letter-spacing: 0.08em; }
    .order-meta { text-align: right; flex-shrink: 0; }
    .order-id { font-size: 11px; font-weight: 900; color: #0f172a; background: #f1f5f9; padding: 2px 7px; border-radius: 6px; }
    .order-date { font-size: 9px; font-weight: 600; color: #64748b; margin-top: 2px; }

    .courier-box {
      background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;
      padding: 6px 8px; display: flex; flex-direction: column; gap: 4px;
    }
    .courier-top { display: flex; justify-content: space-between; align-items: center; gap: 6px; }
    .courier-name { font-size: 11px; font-weight: 900; text-transform: uppercase; color: #0369a1; }
    .courier-status {
      font-size: 9px; font-weight: 800; text-transform: uppercase;
      background: #e0f2fe; color: #0369a1; padding: 1px 6px; border-radius: 4px; margin-left: 4px;
    }
    .area-pill {
      font-size: 9px; font-weight: 800; text-transform: uppercase;
      background: #0f172a; color: #fff; padding: 2px 6px; border-radius: 4px;
    }
    .tracking-grid { display: flex; flex-wrap: wrap; gap: 8px; font-size: 10.5px; color: #334155; }
    .track-line strong { color: #0f172a; font-size: 11px; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .barcode-wrap { margin-top: 2px; }

    .customer-box {
      border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 8px;
    }
    .box-label {
      font-size: 8.5px; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.06em; color: #64748b; margin-bottom: 3px;
    }
    .customer-top { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; flex-wrap: wrap; }
    .customer-name { font-size: 13px; font-weight: 900; color: #0f172a; }
    .customer-phone { font-size: 12px; font-weight: 900; font-family: ui-monospace, monospace; color: #0f172a; }
    .customer-addr { font-size: 10.5px; font-weight: 600; color: #334155; line-height: 1.3; margin-top: 2px; }

    .items-box {
      border-top: 1px dashed #cbd5e1; padding-top: 5px;
    }
    .items-list { display: flex; flex-direction: column; gap: 3px; }
    .item-row {
      display: flex; justify-content: space-between; align-items: flex-start; gap: 6px;
      font-size: 10.5px; line-height: 1.25; padding: 2px 0; border-bottom: 1px dotted #e2e8f0;
    }
    .item-row:last-child { border-bottom: none; }
    .item-main { display: flex; align-items: flex-start; gap: 4px; min-width: 0; flex: 1; }
    .item-idx { font-weight: 800; color: #64748b; }
    .item-info { min-width: 0; }
    .item-name { font-weight: 800; color: #0f172a; word-break: break-word; }
    .item-attrs { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; }
    .attr-pill {
      background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px;
      padding: 0 5px; font-size: 9px; font-weight: 800; color: #1e293b;
    }
    .item-qty {
      font-size: 10px; font-weight: 900; background: #0f172a; color: #fff;
      padding: 1px 6px; border-radius: 4px; white-space: nowrap;
    }

    .sticker-price-block {
      display: none;
      justify-content: space-between; align-items: center;
      border-top: 1.5px solid #0f172a; padding-top: 4px; font-size: 11px;
    }
    .show-prices .sticker-price-block { display: flex; }

    @media print {
      body { background: #ffffff; padding: 0; }
      .no-print { display: none !important; }
      .stickers-sheet { max-width: 100%; }
      .layout-thermal { max-width: 100%; }
    }
  </style>
  <style id="page-size-style">
    ${defaultLayout === 'thermal' ? '@page { size: 4in 6in; margin: 2mm; }' : '@page { size: A4 portrait; margin: 6mm; }'}
  </style>
</head>
<body class="${showPriceClass}">
  <div class="toolbar no-print">
    <div class="toolbar-left">
      <span class="count-badge">${safeOrders.length} টি পার্সেল স্টিকার</span>
      <span style="font-size:12px;color:#64748b;font-weight:600;">শপ লোগো, কাস্টমার তথ্য, কুরিয়ার ট্র্যাকিং ও পণ্যের সাইজ/কালারসহ</span>
    </div>
    <div class="toolbar-right">
      <select id="layout-select" class="select-layout" onchange="const s=document.getElementById('sheet'); s.className='stickers-sheet layout-'+this.value; document.getElementById('page-size-style').textContent = this.value === 'thermal' ? '@page { size: 4in 6in; margin: 2mm; }' : '@page { size: A4 portrait; margin: 6mm; }';">
        <option value="thermal"${defaultLayout === 'thermal' ? ' selected' : ''}>স্টিকার রোল (১টি করে সিরিয়াল · 4×6 in)</option>
        <option value="a4-4"${defaultLayout === 'a4-4' ? ' selected' : ''}>A4 স্টিকার (৪টি/পৃষ্ঠা · 95×132mm)</option>
        <option value="a4-6"${defaultLayout === 'a4-6' ? ' selected' : ''}>A4 কমপ্যাক্ট (৬টি/পৃষ্ঠা · 95×88mm)</option>
      </select>
      <label class="toggle-label">
        <input type="checkbox" id="toggle-price" ${options.showPrice ? 'checked' : ''} onchange="document.body.classList.toggle('show-prices', this.checked)" />
        প্রাইস/COD দেখান
      </label>
      <button type="button" class="print-btn" onclick="window.print()">🖨️ প্রিন্ট করুন (${safeOrders.length})</button>
    </div>
  </div>
  <main id="sheet" class="stickers-sheet layout-${escapeHtml(defaultLayout)}">
    ${stickerCardsHtml}
  </main>
</body>
</html>`;
}

export function printBulkOrderStickers(orders: any[], siteConfig?: any): void {
  const safeOrders = Array.isArray(orders) ? orders.filter(Boolean) : [];
  if (safeOrders.length === 0) {
    toast.error('প্রিন্ট করার জন্য অন্তত একটি অর্ডার সিলেক্ট করুন!');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    toast.error('পপ-আপ ব্লক করা হয়েছে—ব্রাউজারে পপ-আপ অনুমতি দিয়ে আবার চেষ্টা করুন।');
    return;
  }

  const html = buildBulkOrderStickersHtml(safeOrders, {
    shopName: siteConfig?.siteName || 'i SHOP BD',
    logoUrl: siteConfig?.logo || '/logo.png',
    baseUrl: typeof window !== 'undefined' ? window.location.origin : '',
    layout: 'thermal',
    showPrice: false,
  });

  printWindow.document.write(html);
  printWindow.document.close();
}

export function printOrderInvoice(order: any): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const itemsHtml = order.items
    .map(
      (item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.name || 'Item'} ${
        item.color && item.color !== 'N/A' ? '(' + item.color + ')' : ''
      }</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Tk ${item.price}</td>
        </tr>
      `
    )
    .join('');

  const html = `
        <html>
          <head>
            <title>Invoice - #${String(order.id).slice(-6).toUpperCase()}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
              .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
              .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
              th { text-align: left; padding: 10px; background: #f9fafb; border-bottom: 2px solid #eee; }
              .totals { width: 300px; margin-left: auto; }
              .tot-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
              .tot-row.grand { font-weight: bold; font-size: 18px; border-bottom: none; border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1 style="margin:0; color: #4F46E5;">INVOICE</h1>
                <p style="margin:5px 0 0 0; color: #666;">Order #${String(order.id).slice(-6).toUpperCase()}</p>
                <p style="margin:5px 0 0 0; color: #666;">Date: ${order.date}</p>
              </div>
            </div>
            
            <div class="details">
              <div>
                <h3 style="margin-top:0; color: #666; font-size: 14px; text-transform: uppercase;">Bill To:</h3>
                <p style="margin: 0 0 5px 0; font-weight: bold; font-size: 16px;">${order.customerName}</p>
                <p style="margin: 0 0 5px 0;">${order.customerPhone}</p>
                <p style="margin: 0;">${order.address}</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <div class="totals">
              <div class="tot-row">
                <span>Subtotal</span>
                <span>Tk ${order.items.reduce(
                  (acc: number, item: any) => acc + item.price * item.quantity,
                  0
                )}</span>
              </div>
              <div class="tot-row">
                <span>Delivery Charge</span>
                <span>Tk ${order.deliveryCharge}</span>
              </div>
              <div class="tot-row grand">
                <span>Total</span>
                <span>Tk ${order.total}</span>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 80px; color: #888; font-size: 12px;">
              <p>Thank you for shopping with us!</p>
            </div>
            
            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                  window.onafterprint = () => window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;
  printWindow.document.write(html);
  printWindow.document.close();
}

export function downloadOrdersCSV(
  orderHistory: any[],
  filterType: 'daily' | 'weekly' | 'monthly' | 'all'
): void {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const filteredOrders = orderHistory.filter((order) => {
    if (filterType === 'all') return true;

    let orderDate: Date;
    const createdAt = order.createdAt;
    if (createdAt) {
      if (typeof createdAt.toDate === 'function') {
        orderDate = createdAt.toDate();
      } else if (typeof createdAt === 'object' && createdAt.seconds) {
        orderDate = new Date(createdAt.seconds * 1000);
      } else {
        orderDate = new Date(createdAt);
      }
    } else {
      orderDate = new Date();
    }
    if (filterType === 'daily') {
      return orderDate >= startOfToday;
    } else if (filterType === 'weekly') {
      return orderDate >= sevenDaysAgo;
    } else if (filterType === 'monthly') {
      return orderDate >= thirtyDaysAgo;
    }
    return true;
  });

  if (filteredOrders.length === 0) {
    toast.error('এই সময়ের কোনো অর্ডার পাওয়া যায়নি!');
    return;
  }

  const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Total', 'Status'];
  const escapeCSV = (val: any) => {
    const str = val === undefined || val === null ? '' : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows = [headers.join(',')];
  filteredOrders.forEach((o) => {
    const row = [
      escapeCSV(o.id),
      escapeCSV(o.date),
      escapeCSV(o.customerName),
      escapeCSV(o.customerPhone),
      escapeCSV(o.total),
      escapeCSV(o.status),
    ];
    csvRows.push(row.join(','));
  });

  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `orders_${filterType}_${new Date().toLocaleDateString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
