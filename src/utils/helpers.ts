export const getOrderLocalDateString = (order: any) => {
  if (order.createdAt) {
    let dateObj: Date;
    if (typeof order.createdAt.toDate === 'function') {
      dateObj = order.createdAt.toDate();
    } else if (order.createdAt.seconds) {
      dateObj = new Date(order.createdAt.seconds * 1000);
    } else {
      dateObj = new Date(order.createdAt);
    }
    if (!isNaN(dateObj.getTime())) {
      return dateObj;
    }
  }
  
  if (order.date && order.date !== "N/A") {
    const datePart = order.date.split(',')[0].trim();
    return datePart;
  }
  return "N/A";
};

export const formatOrderGroupDate = (dateStrOrObj: any) => {
  if (!dateStrOrObj || dateStrOrObj === "N/A") return "Other";
  
  let datePart = "";
  let dateObj: Date | null = null;
  
  if (dateStrOrObj instanceof Date) {
    dateObj = dateStrOrObj;
    datePart = dateObj.toLocaleDateString("en-US");
  } else {
    datePart = String(dateStrOrObj).trim();
  }
  
  if (!dateObj) {
    const parts = datePart.split(/[\/\-]/);
    if (parts.length === 3) {
      const bengaliToEnglishMap: Record<string, string> = {
        '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
        '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
      };
      const toEnglishDigits = (str: string) => str.replace(/[০-৯]/g, m => bengaliToEnglishMap[m] || m);
      
      const p0 = parseInt(toEnglishDigits(parts[0]));
      const p1 = parseInt(toEnglishDigits(parts[1]));
      const p2 = parseInt(toEnglishDigits(parts[2]));
      
      if (!isNaN(p0) && !isNaN(p1) && !isNaN(p2)) {
        if (p0 > 1000) {
          dateObj = new Date(p0, p1 - 1, p2);
        } else {
          dateObj = new Date(p2, p1 - 1, p0);
        }
      }
    }
  }

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  
  const todayStrBn = today.toLocaleDateString("en-US");
  const yesterdayStrBn = yesterday.toLocaleDateString("en-US");
  const todayStrEn = today.toLocaleDateString("en-US");
  const yesterdayStrEn = yesterday.toLocaleDateString("en-US");

  const enMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const toBengaliDigits = (num: number | string) => String(num);

  const getFormattedDateText = (d: Date) => {
    const day = d.getDate();
    const month = enMonths[d.getMonth()];
    const year = d.getFullYear();
    return `${toBengaliDigits(day)} ${month}, ${toBengaliDigits(year)}`;
  };
  
  if (dateObj && !isNaN(dateObj.getTime())) {
    const isToday = dateObj.toDateString() === today.toDateString();
    const isYesterday = dateObj.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return `Today (${getFormattedDateText(dateObj)})`;
    } else if (isYesterday) {
      return `Yesterday (${getFormattedDateText(dateObj)})`;
    } else {
      return getFormattedDateText(dateObj);
    }
  }
  
  if (datePart === todayStrBn || datePart === todayStrEn) {
    return `Today (${datePart})`;
  } else if (datePart === yesterdayStrBn || datePart === yesterdayStrEn) {
    return `Yesterday (${datePart})`;
  }
  
  return datePart;
};

export const toBengaliNumber = (num: number | string) => {
  return String(num);
};

export const formatEnglishDateTime = (dateVal: any): string => {
  if (!dateVal) return "-";
  
  const bengaliToEnglishMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  const toEnglishDigits = (str: string) => str.replace(/[০-৯]/g, m => bengaliToEnglishMap[m] || m);

  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    return dateVal.toLocaleString("en-US", { dateStyle: "short", timeStyle: "medium" });
  }

  if (typeof dateVal === 'object') {
    if (typeof dateVal.toDate === 'function') {
      const d = dateVal.toDate();
      if (!isNaN(d.getTime())) return d.toLocaleString("en-US", { dateStyle: "short", timeStyle: "medium" });
    }
    if (dateVal.seconds) {
      const d = new Date(dateVal.seconds * 1000);
      if (!isNaN(d.getTime())) return d.toLocaleString("en-US", { dateStyle: "short", timeStyle: "medium" });
    }
  }

  const str = String(dateVal).trim();
  return toEnglishDigits(str);
};

export const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};

export const cleanLatex = (text: string) => {
  if (!text) return text;
  let cleaned = text;
  cleaned = cleaned.replace(/\\times/g, "x");
  cleaned = cleaned.replace(/\\text\{([^}]*)\}/g, "$1");
  cleaned = cleaned.replace(/\$/g, "");
  return cleaned;
};

export const sumValues = (obj: Record<string, number>): number => { const vals = Object.values(obj); let s = 0; for (const v of vals) s += Number(v); return s; };

/**
 * Professional, concise e-commerce slug generator.
 * Converts symbols (& -> and, + -> plus, @ -> at, decimals 22.5 -> 22-5),
 * strips illegal characters while keeping clean English/Bengali alphanumeric words,
 * and cleanly truncates at word boundaries.
 */
export const slugify = (text: string, maxLen = 38): string => {
  if (!text) return "";
  let s = text
    .toString()
    .trim()
    .replace(/&/g, " and ")
    .replace(/\+/g, " plus ")
    .replace(/@/g, " at ")
    .replace(/(\d)\.(\d)/g, "$1-$2")
    .toLowerCase()
    .replace(/[^\w\s\u0980-\u09FF-]/g, "")
    .replace(/[\s_–—-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (s.length > maxLen) {
    const cut = s.substring(0, maxLen);
    const lastHyphen = cut.lastIndexOf("-");
    s = (lastHyphen > 10 ? cut.substring(0, lastHyphen) : cut).replace(/-+$/, "");
  }

  return s;
};

/**
 * Generates a clean, short, standard product URL slug.
 * Prioritizes:
 * 1. Explicit custom slug (e.g. "awei-p103")
 * 2. Short SMS Name (e.g. "galaxy-a55-491298")
 * 3. Shortened core name (max ~35 chars) + short 6-digit ID suffix
 */
export const getProductSlug = (product: any): string => {
  if (!product) return "";
  
  // 1. Explicit custom slug set by admin
  if (product.slug && typeof product.slug === "string" && product.slug.trim()) {
    const custom = slugify(product.slug.trim(), 50);
    if (custom) return custom;
  }

  // 2. Short SMS Name if available
  if (product.smsName && typeof product.smsName === "string" && product.smsName.trim().length >= 3) {
    const smsSlug = slugify(product.smsName.trim(), 35);
    const prodId = product.id ? String(product.id).trim() : "";
    if (smsSlug) {
      if (prodId && !smsSlug.includes(prodId.toLowerCase())) {
        const shortId = prodId.length > 8 ? prodId.slice(-6) : prodId;
        return `${smsSlug}-${shortId}`;
      }
      return smsSlug;
    }
  }

  // 3. Compact core name with short ID suffix
  const rawName = product.name || product.title || "";
  const nameSlug = slugify(rawName, 35);
  const prodId = product.id ? String(product.id).trim() : "";

  if (nameSlug && prodId) {
    if (nameSlug.endsWith(prodId.toLowerCase())) {
      return nameSlug;
    }
    const shortId = prodId.length > 8 ? prodId.slice(-6) : prodId;
    return `${nameSlug}-${shortId}`;
  }

  return nameSlug || prodId || "";
};

/**
 * Standard Short Product Path: /p/{slug}
 * (e.g. https://rokomariponnohari.com/p/awei-pa-103-491298)
 */
export const getProductPath = (product: any): string => {
  const slug = getProductSlug(product);
  return slug ? `/p/${slug}` : "/";
};

/**
 * Robust helper to extract product identifier from the current browser URL.
 * Supports /p/:slug, /product/:slug, ?p=..., ?product=..., ?landing=..., ?id=...
 * Cleanly strips query params (e.g. ?fbclid=...), trailing slashes, and hash fragments.
 */
export const getProductIdFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname || '';
  const urlParams = new URLSearchParams(window.location.search);

  // 1. Query parameters (?product=..., ?p=..., ?landing=..., ?id=...)
  const queryId = urlParams.get('product') || urlParams.get('p') || urlParams.get('landing') || urlParams.get('id');
  if (queryId && queryId.trim()) {
    return decodeURIComponent(queryId.trim());
  }

  // 2. Short /p/:slug or legacy /product/:slug
  if (path.startsWith('/p/')) {
    const raw = path.replace(/^\/p\//, '').replace(/\/+$/, '').split('/')[0].split('?')[0];
    if (raw && raw.trim()) return decodeURIComponent(raw.trim());
  } else if (path.startsWith('/product/')) {
    const raw = path.replace(/^\/product\//, '').replace(/\/+$/, '').split('/')[0].split('?')[0];
    if (raw && raw.trim()) return decodeURIComponent(raw.trim());
  }

  return null;
};

/**
 * Robust, multi-strategy product finder from URL slug or ID.
 */
export const findProductBySlugOrId = (products: any[], slugOrId: string): any => {
  if (!products || !Array.isArray(products) || !slugOrId) return null;
  let decoded = decodeURIComponent(String(slugOrId)).trim().toLowerCase();
  decoded = decoded.replace(/\/+$/, '').split('?')[0].split('#')[0];
  if (!decoded) return null;
  
  // 1. Direct ID match (e.g. "1740523491298" or "p103")
  let found = products.find(p => String(p.id).toLowerCase() === decoded);
  if (found) return found;

  // 2. Direct Product Code match (e.g. "SAM-A55", "PA-103")
  found = products.find(p => p.code && String(p.code).trim().toLowerCase() === decoded);
  if (found) return found;

  // 3. Direct slug match (custom slug or exact match)
  found = products.find(p => p.slug && String(p.slug).trim().toLowerCase() === decoded);
  if (found) return found;

  // 4. Computed getProductSlug match
  found = products.find(p => getProductSlug(p).toLowerCase() === decoded);
  if (found) return found;

  // 5. Normalized slug comparison (handles dots vs dashes, spaces, etc.)
  const normalizedInput = slugify(decoded, 60);
  if (normalizedInput) {
    found = products.find(p => getProductSlug(p).toLowerCase() === normalizedInput || slugify(p.slug || '').toLowerCase() === normalizedInput);
    if (found) return found;
  }

  // 6. Trailing segment as full ID or 6-digit short ID suffix
  const parts = decoded.split('-');
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    if (lastPart) {
      found = products.find(p => {
        const pid = String(p.id).toLowerCase();
        return pid === lastPart || (lastPart.length >= 4 && pid.endsWith(lastPart));
      });
      if (found) return found;
    }

    // Try multi-hyphen candidate IDs from the right
    for (let i = 1; i < parts.length; i++) {
      const candidateId = parts.slice(i).join('-');
      found = products.find(p => {
        const pid = String(p.id).toLowerCase();
        return pid === candidateId || (candidateId.length >= 4 && pid.endsWith(candidateId));
      });
      if (found) return found;
    }
  }

  // 7. Substring ID match (if ID is longer than 5 chars and contained in URL)
  found = products.find(p => p.id && String(p.id).length >= 5 && decoded.includes(String(p.id).toLowerCase()));
  if (found) return found;

  // 8. SMS Name slug match
  found = products.find(p => p.smsName && slugify(p.smsName).toLowerCase() === decoded);
  if (found) return found;

  // 9. Slugified name match (without ID attached)
  found = products.find(p => slugify(p.name || '', 60).toLowerCase() === decoded || slugify(p.name || '', 60).toLowerCase() === normalizedInput);
  if (found) return found;

  // 10. StartsWith or Partial match as resilient fallback
  found = products.find(p => {
    const nameSlug = slugify(p.name || '', 40).toLowerCase();
    return nameSlug && (decoded.startsWith(nameSlug) || nameSlug.startsWith(decoded) || normalizedInput.startsWith(nameSlug) || nameSlug.startsWith(normalizedInput));
  });
  if (found) return found;

  return null;
};

export const getCategorySlug = (category: any): string => {
  const name = typeof category === 'string' ? category : (category?.name || '');
  return slugify(name);
};

export const getCategoryPath = (category: any): string => {
  const slug = getCategorySlug(category);
  return slug ? `/category/${slug}` : '/';
};

export const findCategoryBySlug = (categories: any[], slug: string): any => {
  if (!categories || !Array.isArray(categories) || !slug) return null;
  const decoded = decodeURIComponent(slug).trim().toLowerCase();
  
  // 1. Direct name match
  let found = categories.find(c => {
    const name = (typeof c === 'string' ? c : c?.name || '').toLowerCase();
    return name === decoded;
  });
  if (found) return found;

  // 2. Slugified name match
  found = categories.find(c => {
    const name = typeof c === 'string' ? c : c?.name || '';
    return slugify(name).toLowerCase() === decoded;
  });
  if (found) return found;

  // 3. Keyword / synonym match for Bengali / English searches
  found = categories.find(c => {
    const name = (typeof c === 'string' ? c : c?.name || '').toLowerCase();
    if (decoded.includes('fan') && name.includes('fan')) return true;
    if ((decoded.includes('power') || decoded.includes('bank')) && (name.includes('power') || name.includes('bank'))) return true;
    if (decoded.includes('watch') && name.includes('watch')) return true;
    if ((decoded.includes('headphone') || decoded.includes('earbud') || decoded.includes('earphone')) && name.includes('headphone')) return true;
    return false;
  });
  if (found) return found;

  return null;
};

export const normalizeProduct = (p: any): any => {
  if (!p) return p;
  let stock = Number(p.stock !== undefined && p.stock !== null ? p.stock : 0);
  if (Array.isArray(p.variants) && p.variants.length > 0) {
    const hasVariantStocks = p.variants.some((v: any) => v && v.stock !== undefined && v.stock !== null);
    if (hasVariantStocks) {
      const sum = p.variants.reduce((acc: number, v: any) => acc + (Number(v?.stock) || 0), 0);
      stock = Math.max(0, sum);
    } else {
      stock = Math.max(0, stock);
    }
  } else {
    stock = Math.max(0, stock);
  }
  return {
    ...p,
    stock
  };
};

export const normalizeProducts = (prods: any[]): any[] => {
  if (!Array.isArray(prods)) return [];
  return prods.map(normalizeProduct);
};