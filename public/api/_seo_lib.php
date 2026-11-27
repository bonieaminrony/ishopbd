<?php
/**
 * iShopBD SEO rules for the server side (first HTML a search engine sees, and the sitemap).
 * Mirrors src/seo/seo.ts. If you change a rule there, change it here too. See SEO.md.
 * Not web-accessible (blocked by .htaccess); only included by index.php and api/sitemap.php.
 */

const SEO_SITE_NAME = 'iShopBD';
const SEO_SITE_URL = 'https://ishopbd.com';
const SEO_OG_IMAGE = 'https://ishopbd.com/og-image.png';
const SEO_TITLE_MAX = 70;
const SEO_DESC_MAX = 158;
const SEO_DEFAULT_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

/* Old category addresses still known to Google -> today's category names. */
const SEO_LEGACY_CATEGORY_SLUGS = [
    'charger-fan' => 'Electrical',
    'power-bank' => 'Gadgets',
    'smart-watch' => 'Gadgets',
    'headphone' => 'Gadgets',
    'mobile-accessories' => 'Gadgets',
    'lifestyle-watch' => 'Lifestyle',
];

function seoLen($s) { return mb_strlen((string)$s, 'UTF-8'); }

function seoCollapse($s) { return trim(preg_replace('/\s+/u', ' ', (string)$s)); }

function seoStripHtml($html) {
    $s = preg_replace('/<[^>]*>?/u', ' ', (string)$html);
    $s = str_replace(['&nbsp;', '&amp;'], [' ', '&'], $s);
    return seoCollapse($s);
}

function seoClip($text, $max) {
    $t = seoCollapse($text);
    if (seoLen($t) <= $max) return $t;
    $cut = mb_substr($t, 0, $max - 1, 'UTF-8');
    $space = mb_strrpos($cut, ' ', 0, 'UTF-8');
    $out = ($space !== false && $space > $max * 0.6) ? mb_substr($cut, 0, $space, 'UTF-8') : $cut;
    $out = preg_replace('/[\s,;:|–—-]+$/u', '', $out);
    return $out . '…';
}

/** Same slug rule as the app (src/utils/helpers.ts slugify, 38 chars). */
function seoSlugify($text, $maxLen = 38) {
    if (!$text) return '';
    $s = trim((string)$text);
    $s = str_replace(['&', '+', '@'], [' and ', ' plus ', ' at '], $s);
    $s = preg_replace('/(\d)\.(\d)/u', '$1-$2', $s);
    $s = mb_strtolower($s, 'UTF-8');
    $s = preg_replace('/[^\w\s\x{0980}-\x{09FF}-]/u', '', $s);
    $s = preg_replace('/[\s_–—-]+/u', '-', $s);
    $s = trim($s, '-');
    if (seoLen($s) > $maxLen) {
        $cut = mb_substr($s, 0, $maxLen, 'UTF-8');
        $lastHyphen = mb_strrpos($cut, '-', 0, 'UTF-8');
        $s = ($lastHyphen !== false && $lastHyphen > 10) ? mb_substr($cut, 0, $lastHyphen, 'UTF-8') : $cut;
        $s = rtrim($s, '-');
    }
    return $s;
}

function seoCategoryPath($category, $sub = null) {
    $slug = seoSlugify($category);
    if ($slug === '') return '/';
    if ($sub && strtolower($sub) !== 'all') {
        $subSlug = seoSlugify($sub);
        if ($subSlug !== '') return "/category/{$slug}/{$subSlug}";
    }
    return "/category/{$slug}";
}

/** Product names carry their own SEO tails ("| Price In Bangladesh", "| iShop BD"); strip them. */
function seoCleanProductName($name) {
    $orig = seoCollapse($name);
    $s = $orig;
    $s = preg_replace('/\b(best\s+)?price\s+in\s+(bangladesh|bd)\b/iu', ' ', $s);
    $s = preg_replace('/\b(i\s*shop\s*bd|ishopbd(\.com)?)\b/iu', ' ', $s);
    $s = preg_replace('/\s*[|–—-]\s*(?=[|–—-]|$)/u', ' ', $s);
    $s = preg_replace('/^[\s|–—-]+|[\s|–—-]+$/u', '', $s);
    $s = preg_replace('/\s*\|\s*\|\s*/u', ' | ', $s);
    $s = seoCollapse($s);
    return $s !== '' ? $s : $orig;
}

function seoIsPublished($p) {
    return is_array($p) && empty($p['deleted']) && (!isset($p['isPublished']) || $p['isPublished'] !== false);
}

function seoAbsoluteUrl($url, $fallback = SEO_OG_IMAGE) {
    $u = trim((string)$url);
    if ($u === '' || strpos($u, 'data:') === 0) return $fallback;
    if (preg_match('~^https?://~i', $u)) return $u;
    return SEO_SITE_URL . ($u[0] === '/' ? '' : '/') . $u;
}

function seoProductImageUrl($p) {
    $img = (string)($p['image'] ?? '');
    if (strpos($img, 'data:') === 0 && !empty($p['id'])) return SEO_SITE_URL . '/api/product-image/' . rawurlencode($p['id']);
    return seoAbsoluteUrl($img);
}

/** Same rule as the product page badge. */
function seoAvailability($p) {
    if (!empty($p['isComingSoon'])) return 'PreOrder';
    $variants = (isset($p['variants']) && is_array($p['variants'])) ? $p['variants'] : [];
    if (count($variants) > 0) {
        foreach ($variants as $v) {
            if ((float)($v['stock'] ?? 0) > 0) return 'InStock';
        }
        return 'OutOfStock';
    }
    if (!isset($p['stock']) || $p['stock'] === '' || $p['stock'] === null) return 'InStock';
    return ((float)$p['stock'] > 0) ? 'InStock' : 'OutOfStock';
}

function seoMoney($n) { return '৳' . number_format(round((float)$n)); }

function seoProductTitle($p) {
    $name = seoCleanProductName($p['name'] ?? '');
    $parts = explode(' | ', $name);
    $head = seoCollapse($parts[0]);
    $brand = ' | ' . SEO_SITE_NAME;
    $options = [
        "{$name} Price in Bangladesh{$brand}",
        "{$name}{$brand}",
        $head !== $name ? "{$head} Price in BD{$brand}" : '',
        "{$head}{$brand}",
    ];
    foreach ($options as $t) {
        if ($t !== '' && seoLen($t) <= SEO_TITLE_MAX) return $t;
    }
    return seoClip($head, SEO_TITLE_MAX - seoLen($brand)) . $brand;
}

function seoProductDescription($p) {
    $custom = seoStripHtml($p['metaDescription'] ?? '');
    if (seoLen($custom) >= 50) return seoClip($custom, SEO_DESC_MAX);
    $name = seoCleanProductName($p['name'] ?? '');
    $tail = 'দাম ' . seoMoney($p['price'] ?? 0) . '। ক্যাশ অন ডেলিভারি, সারা বাংলাদেশে হোম ডেলিভারি।';
    $about = seoStripHtml(!empty($p['shortDescription']) ? $p['shortDescription'] : ($p['description'] ?? ''));
    $lead = ($about !== '' && mb_strtolower($about, 'UTF-8') !== mb_strtolower($name, 'UTF-8')) ? $about : "{$name} কিনুন " . SEO_SITE_NAME . ' থেকে।';
    $room = SEO_DESC_MAX - seoLen($tail) - 1;
    return seoClip($lead, max(60, $room)) . ' ' . $tail;
}

function seoCategoryTitle($category, $sub = null) {
    $hasSub = $sub && strtolower($sub) !== 'all';
    $t = $hasSub ? "{$sub} Price in Bangladesh – {$category} | " . SEO_SITE_NAME : "{$category} Price in Bangladesh | " . SEO_SITE_NAME;
    if (seoLen($t) <= SEO_TITLE_MAX) return $t;
    return $hasSub ? "{$sub} – {$category} | " . SEO_SITE_NAME : "{$category} | " . SEO_SITE_NAME;
}

function seoCategoryDescription($category, $sub, $items) {
    $label = ($sub && strtolower($sub) !== 'all') ? "{$sub} ({$category})" : $category;
    $names = implode(', ', array_map(function ($p) { return seoClip(seoCleanProductName($p['name'] ?? ''), 34); }, array_slice($items, 0, 3)));
    $count = count($items);
    $base = $count ? "{$label} এর {$count}টি পণ্য সেরা দামে: {$names}।" : "{$label} সেরা দামে কিনুন " . SEO_SITE_NAME . ' থেকে।';
    return seoClip("{$base} ক্যাশ অন ডেলিভারি, সারা বাংলাদেশে হোম ডেলিভারি।", SEO_DESC_MAX);
}

/** Categories that have published products, most products first. */
function seoPublishedCategories($products) {
    $count = [];
    foreach ($products as $p) {
        if (!seoIsPublished($p) || empty($p['category'])) continue;
        $count[$p['category']] = ($count[$p['category']] ?? 0) + 1;
    }
    arsort($count);
    return array_keys($count);
}

function seoSubcategories($products, $category) {
    $subs = [];
    foreach ($products as $p) {
        if (!seoIsPublished($p) || ($p['category'] ?? '') !== $category || empty($p['subcategory'])) continue;
        $subs[$p['subcategory']] = true;
    }
    return array_keys($subs);
}

function seoHomeTitle() { return SEO_SITE_NAME . ' (আই শপ বিডি) | Online Shopping in Bangladesh'; }

function seoHomeDescription($products) {
    $cats = implode(', ', array_slice(seoPublishedCategories($products), 0, 5));
    return seoClip(SEO_SITE_NAME . ' (আই শপ বিডি) – বাংলাদেশের অনলাইন শপ' . ($cats ? ": {$cats}" : '') . '। আসল পণ্য, সেরা দাম, ক্যাশ অন ডেলিভারি ও সারা দেশে হোম ডেলিভারি।', SEO_DESC_MAX);
}

function seoBreadcrumb($items) {
    $list = [];
    foreach (array_values($items) as $i => $it) {
        $list[] = ['@type' => 'ListItem', 'position' => $i + 1, 'name' => $it['name'], 'item' => $it['url']];
    }
    return ['@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => $list];
}

function seoProductJsonLd($p, $productPath) {
    $url = SEO_SITE_URL . $productPath;
    $images = [seoProductImageUrl($p)];
    foreach ((isset($p['images']) && is_array($p['images'])) ? $p['images'] : [] as $img) {
        if (!is_string($img)) continue;
        $abs = seoAbsoluteUrl($img, '');
        if ($abs !== '' && !in_array($abs, $images, true)) $images[] = $abs;
    }
    $images = array_slice($images, 0, 6);
    $price = (float)($p['price'] ?? 0);
    $custom = (float)($p['deliveryCharge'] ?? 0);
    if (!empty($p['isFreeDelivery'])) $rates = [['value' => 0]];
    elseif ($custom > 0) $rates = [['value' => $custom]];
    else $rates = [['value' => 70, 'region' => 'Dhaka'], ['value' => 130]];

    $shipping = [];
    foreach ($rates as $r) {
        $dest = ['@type' => 'DefinedRegion', 'addressCountry' => 'BD'];
        if (!empty($r['region'])) $dest['addressRegion'] = $r['region'];
        $shipping[] = [
            '@type' => 'OfferShippingDetails',
            'shippingRate' => ['@type' => 'MonetaryAmount', 'value' => $r['value'], 'currency' => 'BDT'],
            'shippingDestination' => $dest,
            'deliveryTime' => [
                '@type' => 'ShippingDeliveryTime',
                'handlingTime' => ['@type' => 'QuantitativeValue', 'minValue' => 0, 'maxValue' => 1, 'unitCode' => 'DAY'],
                'transitTime' => ['@type' => 'QuantitativeValue', 'minValue' => 1, 'maxValue' => !empty($r['region']) ? 2 : 4, 'unitCode' => 'DAY'],
            ],
        ];
    }

    $desc = seoStripHtml(!empty($p['shortDescription']) ? $p['shortDescription'] : ($p['description'] ?? ''));
    if ($desc === '') $desc = seoCleanProductName($p['name'] ?? '') . ' – ' . SEO_SITE_NAME;

    $schema = [
        '@context' => 'https://schema.org',
        '@type' => 'Product',
        '@id' => "{$url}#product",
        'name' => seoCleanProductName($p['name'] ?? ''),
        'description' => seoClip($desc, 5000),
        'image' => $images,
        'url' => $url,
        'sku' => (string)(!empty($p['code']) ? $p['code'] : ($p['id'] ?? '')),
    ];
    if (!empty($p['code'])) $schema['mpn'] = (string)$p['code'];
    if (!empty($p['category'])) $schema['category'] = !empty($p['subcategory']) ? "{$p['category']} > {$p['subcategory']}" : $p['category'];
    $brand = seoCollapse($p['brand'] ?? '');
    if ($brand !== '' && strcasecmp($brand, 'china') !== 0) $schema['brand'] = ['@type' => 'Brand', 'name' => $brand];
    $schema['offers'] = [
        '@type' => 'Offer',
        'url' => $url,
        'priceCurrency' => 'BDT',
        'price' => $price,
        'priceValidUntil' => gmdate('Y-m-d', strtotime('+1 year')),
        'availability' => 'https://schema.org/' . seoAvailability($p),
        'itemCondition' => 'https://schema.org/NewCondition',
        'seller' => ['@type' => 'Organization', 'name' => SEO_SITE_NAME, 'url' => SEO_SITE_URL],
        'shippingDetails' => $shipping,
    ];
    $rating = (float)($p['rating'] ?? 0);
    $reviews = (int)($p['reviewCount'] ?? 0);
    if ($rating > 0 && $reviews > 0) {
        $schema['aggregateRating'] = ['@type' => 'AggregateRating', 'ratingValue' => min(5, $rating), 'reviewCount' => $reviews, 'bestRating' => 5];
    }
    return $schema;
}

function seoEsc($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

function seoJson($data) { return json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG); }

/** Write one consistent set of head tags into index.html. */
function seoApplyHead($html, $seo) {
    $title = seoEsc($seo['title']);
    $desc = seoEsc($seo['description']);
    $url = seoEsc($seo['canonical']);
    $img = seoEsc($seo['image'] ?? SEO_OG_IMAGE);
    $type = seoEsc($seo['ogType'] ?? 'website');
    $robots = seoEsc($seo['robots'] ?? SEO_DEFAULT_ROBOTS);

    $html = preg_replace('/<title>.*?<\/title>/is', "<title>{$title}</title>", $html, 1);
    $set = function ($html, $attr, $key, $value) {
        $pattern = '/<meta\s+' . $attr . '="' . preg_quote($key, '/') . '"\s+content="[^"]*"\s*\/?>/i';
        $tag = "<meta {$attr}=\"{$key}\" content=\"{$value}\" />";
        if (preg_match($pattern, $html)) return preg_replace($pattern, $tag, $html, 1);
        return str_replace('</head>', "    {$tag}\n</head>", $html);
    };
    $html = $set($html, 'name', 'description', $desc);
    $html = $set($html, 'name', 'robots', $robots);
    $html = $set($html, 'property', 'og:type', $type);
    $html = $set($html, 'property', 'og:title', $title);
    $html = $set($html, 'property', 'og:description', $desc);
    $html = $set($html, 'property', 'og:url', $url);
    $html = $set($html, 'property', 'og:image', $img);
    $html = $set($html, 'property', 'og:image:secure_url', $img);
    $html = $set($html, 'name', 'twitter:title', $title);
    $html = $set($html, 'name', 'twitter:description', $desc);
    $html = $set($html, 'name', 'twitter:image', $img);
    if (($seo['ogType'] ?? '') === 'product' && isset($seo['price'])) {
        $html = str_replace('</head>', '    <meta property="product:price:amount" content="' . seoEsc($seo['price']) . "\" />\n    <meta property=\"product:price:currency\" content=\"BDT\" />\n</head>", $html);
    }
    $canonical = "<link rel=\"canonical\" href=\"{$url}\" />";
    if (strpos($html, '<!-- CANONICAL_URL_PLACEHOLDER -->') !== false) {
        $html = str_replace('<!-- CANONICAL_URL_PLACEHOLDER -->', $canonical, $html);
    } else {
        $html = preg_replace('/<link rel="canonical" href="[^"]*"\s*\/?>/i', $canonical, $html, 1);
    }
    $blocks = '';
    foreach (($seo['jsonLd'] ?? []) as $id => $data) {
        if ($data === null) continue;
        $blocks .= '    <script type="application/ld+json" id="' . seoEsc($id) . '">' . seoJson($data) . "</script>\n";
    }
    if ($blocks !== '') $html = str_replace('</head>', $blocks . '</head>', $html);
    return $html;
}

/* -------- Visible first-paint content (real text and links, replaced by the app when it loads) */

const SEO_SSR_STYLE = '<style>.ssr{padding:16px 0 24px;color:#1f2937;font-family:inherit}.ssr nav{font-size:12px;color:#6b7280;margin:0 0 10px}.ssr nav a{color:#6b7280;text-decoration:none}.ssr h1{font-size:20px;line-height:1.35;color:#26225a;margin:0 0 8px;font-weight:700}.ssr p{font-size:14px;line-height:1.6;color:#4b5563;margin:0 0 12px}.ssr .price{font-size:24px;font-weight:700;color:#111827;margin:4px 0 12px}.ssr .hero{width:100%;max-width:480px;aspect-ratio:1/1;object-fit:contain;background:#f9fafb;border-radius:16px;display:block;margin:0 0 14px}.ssr .chips{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 16px}.ssr .chips a{padding:8px 14px;border:1px solid #e5e7eb;border-radius:999px;font-size:13px;color:#374151;text-decoration:none;background:#fff}.ssr .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}@media(min-width:768px){.ssr .grid{grid-template-columns:repeat(4,1fr);gap:16px}.ssr h1{font-size:26px}}.ssr .card{display:block;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;text-decoration:none;color:inherit}.ssr .card img{width:100%;aspect-ratio:1/1;object-fit:contain;display:block;background:#fff}.ssr .card span{display:block;padding:8px 10px 2px;font-size:13px;line-height:1.3;color:#1f2937;height:2.6em;overflow:hidden}.ssr .card b{display:block;padding:0 10px 10px;font-size:14px;color:#da1522}.sk-hero,.sk-cats,.sk-grid{display:none}</style>';

function seoSsrCards($products, $productPathFn, $limit = 24) {
    $out = '<div class="grid">';
    foreach (array_slice($products, 0, $limit) as $p) {
        $href = seoEsc($productPathFn($p));
        $name = seoEsc(seoCleanProductName($p['name'] ?? ''));
        $img = (string)($p['image'] ?? '');
        $imgSrc = (strpos($img, 'data:') === 0 || $img === '') ? '/api/product-image/' . rawurlencode($p['id'] ?? '') : $img;
        $out .= "<a class=\"card\" href=\"{$href}\"><img src=\"" . seoEsc($imgSrc) . "\" alt=\"{$name}\" loading=\"lazy\" decoding=\"async\" width=\"300\" height=\"300\"><span>{$name}</span><b>" . seoMoney($p['price'] ?? 0) . '</b></a>';
    }
    return $out . '</div>';
}

function seoInjectSsr($html, $inner) {
    $block = SEO_SSR_STYLE . '<main class="ssr" id="ssr-content">' . $inner . '</main>';
    if (strpos($html, '<div class="sk-hero"></div>') !== false) {
        return str_replace('<div class="sk-hero"></div>', $block . '<div class="sk-hero"></div>', $html);
    }
    return str_replace('<div id="root">', '<div id="root">' . $block, $html);
}
