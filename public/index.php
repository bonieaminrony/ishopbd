<?php
/**
 * iShopBD - first HTML for every page: titles, descriptions, canonical links,
 * structured data and visible first-paint content. Rules live in api/_seo_lib.php (see SEO.md).
 * Fully Compliant with Google Search Console, Rich Results, and Schema.org
 */

header("Content-Type: text/html; charset=UTF-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("X-LiteSpeed-Cache-Control: no-cache");
ini_set('default_charset', 'UTF-8');
if (function_exists('mb_internal_encoding')) {
    mb_internal_encoding('UTF-8');
}

$htmlPath = __DIR__ . '/index.html';
if (!file_exists($htmlPath)) {
    echo "<!DOCTYPE html><html><head><title>i SHOP BD</title></head><body>index.html not found</body></html>";
    exit;
}

$html = file_get_contents($htmlPath);
require_once __DIR__ . '/api/_seo_lib.php';

// Protocol & Host detection
$protocol = "https";
if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
    $protocol = "https";
} elseif (isset($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
    $protocol = $_SERVER['HTTP_X_FORWARDED_PROTO'];
} elseif (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == '80' && (!isset($_SERVER['HTTP_HOST']) || strpos($_SERVER['HTTP_HOST'], 'localhost') !== false)) {
    $protocol = "http";
}

$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'ishopbd.com';
$baseUrl = "$protocol://$host";
$defaultOgImage = "$baseUrl/og-image.png";

// Helper: Slugify string
function slugify($text, $maxLen = 45) {
    if (!$text) return "";
    $s = trim((string)$text);
    $s = str_replace(['&', '+', '@'], [' and ', ' plus ', ' at '], $s);
    $s = preg_replace('/(\d)\.(\d)/', '$1-$2', $s);
    $s = mb_strtolower($s, 'UTF-8');
    $s = preg_replace('/[^\w\s\x{0980}-\x{09FF}-]/u', '', $s);
    $s = preg_replace('/[\s_–—-]+/u', '-', $s);
    $s = trim($s, '-');
    if (mb_strlen($s, 'UTF-8') > $maxLen) {
        $cut = mb_substr($s, 0, $maxLen, 'UTF-8');
        $lastHyphen = mb_strrpos($cut, '-', 0, 'UTF-8');
        $s = ($lastHyphen !== false && $lastHyphen > 10) ? mb_substr($cut, 0, $lastHyphen, 'UTF-8') : $cut;
    }
    return trim($s, '-');
}

// Helper: Generate Canonical Product Slug
function getProductSlug($p) {
    if (!$p) return "";
    if (!empty($p['slug']) && is_string($p['slug']) && trim($p['slug']) !== '') {
        $custom = slugify($p['slug'], 50);
        if ($custom) return $custom;
    }
    if (!empty($p['smsName']) && is_string($p['smsName']) && mb_strlen(trim($p['smsName']), 'UTF-8') >= 3) {
        $smsSlug = slugify(trim($p['smsName']), 35);
        $prodId = !empty($p['id']) ? trim((string)$p['id']) : "";
        if ($smsSlug) {
            if ($prodId && strpos($smsSlug, strtolower($prodId)) === false) {
                $shortId = strlen($prodId) > 8 ? substr($prodId, -6) : $prodId;
                return "{$smsSlug}-{$shortId}";
            }
            return $smsSlug;
        }
    }
    $rawName = !empty($p['name']) ? $p['name'] : (!empty($p['title']) ? $p['title'] : "");
    $nameSlug = slugify($rawName, 35);
    $prodId = !empty($p['id']) ? trim((string)$p['id']) : "";
    if ($nameSlug && $prodId) {
        if (substr($nameSlug, -strlen($prodId)) === strtolower($prodId)) {
            return $nameSlug;
        }
        $shortId = strlen($prodId) > 8 ? substr($prodId, -6) : $prodId;
        return "{$nameSlug}-{$shortId}";
    }
    return $nameSlug ?: $prodId;
}

// Helper: Normalize Category Slug
function getCategorySlug($categoryName) {
    return seoSlugify((string)$categoryName);
}

// Helper: Parse Firestore value
function parseFirestoreValue($value) {
    if (!is_array($value)) return $value;
    if (isset($value['stringValue'])) return $value['stringValue'];
    if (isset($value['integerValue'])) return (int)$value['integerValue'];
    if (isset($value['doubleValue'])) return (float)$value['doubleValue'];
    if (isset($value['booleanValue'])) return (bool)$value['booleanValue'];
    if (isset($value['timestampValue'])) return $value['timestampValue'];
    if (isset($value['nullValue'])) return null;
    if (isset($value['arrayValue'])) {
        $arr = [];
        if (isset($value['arrayValue']['values']) && is_array($value['arrayValue']['values'])) {
            foreach ($value['arrayValue']['values'] as $item) {
                $arr[] = parseFirestoreValue($item);
            }
        }
        return $arr;
    }
    if (isset($value['mapValue'])) {
        $map = [];
        if (isset($value['mapValue']['fields']) && is_array($value['mapValue']['fields'])) {
            foreach ($value['mapValue']['fields'] as $k => $v) {
                $map[$k] = parseFirestoreValue($v);
            }
        }
        return $map;
    }
    return null;
}

// Helper: Parse Firestore Document
function parseFirestoreDoc($doc) {
    $pathParts = explode('/', $doc['name'] ?? '');
    $id = end($pathParts);
    $fields = $doc['fields'] ?? [];
    $product = ['id' => $id];
    foreach ($fields as $key => $val) {
        if ($key === 'landingConfig') continue;
        $product[$key] = parseFirestoreValue($val);
    }
    if (!empty($product['image']) && is_string($product['image']) && strpos($product['image'], 'data:image/') === 0) {
        $product['image'] = "/api/product-image/{$id}";
    }
    if (!empty($product['images']) && is_array($product['images'])) {
        foreach ($product['images'] as $idx => $img) {
            if (is_string($img) && strpos($img, 'data:image/') === 0) {
                $product['images'][$idx] = "/api/product-image/{$id}?idx={$idx}";
            }
        }
    }
    $product['price'] = isset($product['price']) ? (float)$product['price'] : 0.0;
    $product['originalPrice'] = isset($product['originalPrice']) ? (float)$product['originalPrice'] : (float)($product['price'] ?? 0);
    $product['discount'] = isset($product['discount']) ? (float)$product['discount'] : 0.0;
    $product['stock'] = isset($product['stock']) ? (int)$product['stock'] : 0;
    $product['isPublished'] = isset($product['isPublished']) ? (bool)$product['isPublished'] : true;
    $product['deleted'] = isset($product['deleted']) ? (bool)$product['deleted'] : false;
    $product['name'] = $product['name'] ?? '';
    $product['category'] = $product['category'] ?? '';
    $product['subcategory'] = $product['subcategory'] ?? '';
    $product['brand'] = $product['brand'] ?? 'i SHOP BD';
    $product['image'] = $product['image'] ?? '';
    $product['description'] = $product['description'] ?? '';
    $product['slug'] = $product['slug'] ?? '';
    $product['rating'] = isset($product['rating']) ? (float)$product['rating'] : 5.0;
    $product['reviewCount'] = isset($product['reviewCount']) ? (int)$product['reviewCount'] : 0;
    return $product;
}

// Fetch all active products with disk cache (zero-latency instant paint)
function getAllProductsCached() {
    $cacheFile = __DIR__ . '/api/products_cache.json';
    $cacheTtl = 86400; // 24 hours (proactively purged when admin saves products)

    if (file_exists($cacheFile)) {
        $fileAge = time() - filemtime($cacheFile);
        $raw = @file_get_contents($cacheFile);
        if ($raw && strlen($raw) > 20) {
            $parsed = json_decode($raw, true);
            if (is_array($parsed) && count($parsed) > 0) {
                // If fresh, return immediately with zero delay
                if ($fileAge < $cacheTtl) {
                    return $parsed;
                }
            }
        }
    }

    // Fetch from Firestore REST API
    $apiKey = getenv('VITE_FIREBASE_API_KEY') ?: 'AIzaSyClPZu-7eztcpTyOT0vVWX-znIwouTg7I8';
    $runQueryUrl = "https://firestore.googleapis.com/v1/projects/i-shop-bd/databases/(default)/documents:runQuery?key=" . urlencode($apiKey);
    $products = [];

    if (function_exists('curl_init')) {
        $ch = curl_init($runQueryUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['structuredQuery' => ['from' => [['collectionId' => 'products']]]]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Referer: https://ishopbd.com/']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 6);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $res = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($code === 200 && $res) {
            $items = json_decode($res, true);
            if (is_array($items)) {
                foreach ($items as $item) {
                    if (isset($item['document']) && is_array($item['document'])) {
                        $p = parseFirestoreDoc($item['document']);
                        if (!empty($p['name']) && empty($p['deleted'])) {
                            $products[] = $p;
                        }
                    }
                }
            }
        }
    }

    if (!empty($products)) {
        if (!file_exists(__DIR__ . '/api')) {
            @mkdir(__DIR__ . '/api', 0755, true);
        }
        @file_put_contents($cacheFile, json_encode($products, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        return $products;
    }

    // Fallback if network was slow: return stale cache if exists
    if (file_exists($cacheFile)) {
        $raw = @file_get_contents($cacheFile);
        if ($raw) {
            $parsed = json_decode($raw, true);
            if (is_array($parsed)) return $parsed;
        }
    }

    return [];
}

// Parse Firestore banner document (preserves full banner image URL / data URI)
function parseFirestoreBannerDoc($doc) {
    $pathParts = explode('/', $doc['name'] ?? '');
    $id = end($pathParts);
    $fields = $doc['fields'] ?? [];
    $banner = ['id' => $id];
    foreach ($fields as $key => $val) {
        $banner[$key] = parseFirestoreValue($val);
    }
    return $banner;
}

// Fetch all active banners with short disk cache (proactively invalidated on admin banner updates)
function getAllBannersCached() {
    $cacheFile = __DIR__ . '/api/banners_cache.json';
    $cacheTtl = 300; // 5 minutes, cleared immediately via /api/invalidate-banner-cache

    if (file_exists($cacheFile)) {
        $fileAge = time() - filemtime($cacheFile);
        $raw = @file_get_contents($cacheFile);
        if ($raw && strlen($raw) > 10 && $fileAge < $cacheTtl) {
            $parsed = json_decode($raw, true);
            if (is_array($parsed) && count($parsed) > 0) {
                usort($parsed, function ($a, $b) {
                    return intval($a['order'] ?? 0) <=> intval($b['order'] ?? 0);
                });
                return $parsed;
            }
        }
    }

    $apiKey = getenv('VITE_FIREBASE_API_KEY') ?: 'AIzaSyClPZu-7eztcpTyOT0vVWX-znIwouTg7I8';
    $runQueryUrl = "https://firestore.googleapis.com/v1/projects/i-shop-bd/databases/(default)/documents:runQuery?key=" . urlencode($apiKey);
    $banners = [];

    if (function_exists('curl_init')) {
        $ch = curl_init($runQueryUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['structuredQuery' => ['from' => [['collectionId' => 'banners']]]]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Referer: https://ishopbd.com/']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        $res = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($code === 200 && $res) {
            $items = json_decode($res, true);
            if (is_array($items)) {
                foreach ($items as $item) {
                    if (isset($item['document']) && is_array($item['document'])) {
                        $banners[] = parseFirestoreBannerDoc($item['document']);
                    }
                }
            }
        }
    }

    if (!empty($banners)) {
        usort($banners, function ($a, $b) {
            return intval($a['order'] ?? 0) <=> intval($b['order'] ?? 0);
        });
        if (!file_exists(__DIR__ . '/api')) {
            @mkdir(__DIR__ . '/api', 0755, true);
        }
        @file_put_contents($cacheFile, json_encode($banners, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        return $banners;
    }

    if (file_exists($cacheFile)) {
        $raw = @file_get_contents($cacheFile);
        if ($raw) {
            $parsed = json_decode($raw, true);
            if (is_array($parsed)) return $parsed;
        }
    }

    return [];
}
// Multi-strategy product finder
function findProductInList($products, $slugOrId) {
    if (empty($products) || empty($slugOrId)) return null;
    $clean = strtolower(trim((string)$slugOrId));
    $clean = trim($clean, '/');

    // 1. Match full ID
    foreach ($products as $p) {
        if (strtolower($p['id'] ?? '') === $clean) return $p;
    }

    // 2. Match custom slug
    foreach ($products as $p) {
        if (!empty($p['slug']) && strtolower($p['slug']) === $clean) return $p;
    }

    // 3. Match computed slug
    foreach ($products as $p) {
        if (strtolower(getProductSlug($p)) === $clean) return $p;
    }

    // 4. Match trailing short ID or full ID after last hyphen
    $parts = explode('-', $clean);
    if (count($parts) > 1) {
        $lastPart = end($parts);
        if (strlen($lastPart) >= 4) {
            foreach ($products as $p) {
                $pid = strtolower($p['id'] ?? '');
                if ($pid === $lastPart || (strlen($lastPart) >= 4 && substr($pid, -strlen($lastPart)) === $lastPart)) {
                    return $p;
                }
            }
        }
    }

    // 5. Match product code (e.g. PA-103, J12)
    foreach ($products as $p) {
        if (!empty($p['code']) && strtolower(trim($p['code'])) === $clean) return $p;
    }

    // 6. Substring match
    foreach ($products as $p) {
        $pid = strtolower($p['id'] ?? '');
        if (strlen($pid) >= 6 && strpos($clean, $pid) !== false) return $p;
    }

    return null;
}

function getEffectiveRequestUri() {
    if (!empty($_GET['__route__'])) {
        return '/' . ltrim((string)$_GET['__route__'], '/');
    }
    if (!empty($_SERVER['REDIRECT_URL']) && !preg_match('#/(?:app|index)\.php#i', (string)$_SERVER['REDIRECT_URL'])) {
        return (string)$_SERVER['REDIRECT_URL'];
    }
    if (!empty($_SERVER['REQUEST_URI']) && !preg_match('#/(?:app|index)\.php#i', (string)$_SERVER['REQUEST_URI'])) {
        return (string)$_SERVER['REQUEST_URI'];
    }
    if (!empty($_SERVER['HTTP_X_ORIGINAL_URL'])) {
        return (string)$_SERVER['HTTP_X_ORIGINAL_URL'];
    }
    if (!empty($_SERVER['HTTP_X_REWRITE_URL'])) {
        return (string)$_SERVER['HTTP_X_REWRITE_URL'];
    }
    if (!empty($_SERVER['REDIRECT_URL'])) {
        return (string)$_SERVER['REDIRECT_URL'];
    }
    if (!empty($_SERVER['REQUEST_URI'])) {
        return (string)$_SERVER['REQUEST_URI'];
    }
    return '';
}

// Fetch all cached products
$allProducts = getAllProductsCached();
$publishedProducts = array_values(array_filter($allProducts, 'seoIsPublished'));
$productPathFn = function ($p) { return '/p/' . getProductSlug($p); };

$effectiveUriEarly = getEffectiveRequestUri();
$pathEarly = parse_url($effectiveUriEarly, PHP_URL_PATH) ?: $effectiveUriEarly;
$pathEarly = '/' . ltrim((string)$pathEarly, '/');
$isOrderSuccessPage = ($pathEarly === '/order-success');
$isDashboard = (bool)preg_match('~^/dashboard(?:/|$)~i', $pathEarly);

// 1. Product page
$productIdentifier = isset($_GET['p']) ? $_GET['p'] : (isset($_GET['product']) ? $_GET['product'] : (isset($_GET['landing']) ? $_GET['landing'] : null));
if (!$productIdentifier && preg_match('~^/(?:product|p|landing)/([^/?#]+)~i', $pathEarly, $matches)) {
    $productIdentifier = urldecode($matches[1]);
}

$matchedProduct = null;
if ($productIdentifier) {
    $found = findProductInList($allProducts, $productIdentifier);
    if ($found && seoIsPublished($found)) $matchedProduct = $found;
}

// 2. Category page (/category/<slug>[/<sub>])
$categorySlug = isset($_GET['category']) ? $_GET['category'] : (isset($_GET['c']) ? $_GET['c'] : null);
$subcategorySlug = isset($_GET['subcategory']) ? $_GET['subcategory'] : (isset($_GET['sub']) ? $_GET['sub'] : null);
if (!$categorySlug && preg_match('~^/(?:category|c)/([^/?#]+)(?:/([^/?#]+))?~i', $pathEarly, $catMatches)) {
    $categorySlug = urldecode($catMatches[1]);
    if (!empty($catMatches[2])) $subcategorySlug = urldecode($catMatches[2]);
}

if ($isDashboard) {
    // Admin panel: never indexed.
    $html = seoApplyHead($html, [
        'title' => 'Dashboard | ' . SEO_SITE_NAME, 'description' => seoHomeDescription($publishedProducts),
        'canonical' => SEO_SITE_URL . '/', 'robots' => 'noindex,nofollow', 'ogType' => 'website', 'jsonLd' => [],
    ]);

} elseif ($matchedProduct) {
    $p = $matchedProduct;
    $path = $productPathFn($p);
    $crumbs = [['name' => SEO_SITE_NAME, 'url' => SEO_SITE_URL . '/']];
    if (!empty($p['category'])) $crumbs[] = ['name' => $p['category'], 'url' => SEO_SITE_URL . seoCategoryPath($p['category'])];
    if (!empty($p['category']) && !empty($p['subcategory'])) $crumbs[] = ['name' => $p['subcategory'], 'url' => SEO_SITE_URL . seoCategoryPath($p['category'], $p['subcategory'])];
    $crumbs[] = ['name' => seoCleanProductName($p['name'] ?? ''), 'url' => SEO_SITE_URL . $path];

    $html = seoApplyHead($html, [
        'title' => seoProductTitle($p),
        'description' => seoProductDescription($p),
        'canonical' => SEO_SITE_URL . $path,
        'ogType' => 'product',
        'image' => seoProductImageUrl($p),
        'price' => (float)($p['price'] ?? 0),
        'jsonLd' => ['seo-ld-page' => seoProductJsonLd($p, $path), 'seo-ld-breadcrumb' => seoBreadcrumb($crumbs)],
    ]);

    $nav = '';
    foreach (array_slice($crumbs, 0, -1) as $c) {
        $nav .= '<a href="' . seoEsc(str_replace(SEO_SITE_URL, '', $c['url']) ?: '/') . '">' . seoEsc($c['name']) . '</a> / ';
    }
    $img = (string)($p['image'] ?? '');
    $imgSrc = (strpos($img, 'data:') === 0 || $img === '') ? '/api/product-image/' . rawurlencode($p['id'] ?? '') : $img;
    $about = seoClip(seoStripHtml(!empty($p['shortDescription']) ? $p['shortDescription'] : ($p['description'] ?? '')), 320);
    $avail = seoAvailability($p) === 'InStock' ? 'ইন স্টক' : (seoAvailability($p) === 'PreOrder' ? 'প্রি-অর্ডার' : 'স্টক শেষ');
    $related = array_values(array_filter($publishedProducts, function ($x) use ($p) {
        return ($x['id'] ?? '') !== ($p['id'] ?? '') && ($x['category'] ?? '') === ($p['category'] ?? '');
    }));
    $inner = '<nav aria-label="Breadcrumb">' . $nav . '</nav>'
        . '<img class="hero" src="' . seoEsc($imgSrc) . '" alt="' . seoEsc(seoCleanProductName($p['name'] ?? '')) . '" width="480" height="480" fetchpriority="high">'
        . '<h1>' . seoEsc($p['name'] ?? '') . '</h1>'
        . '<div class="price">' . seoMoney($p['price'] ?? 0) . '</div>'
        . '<p>' . seoEsc($avail) . ($about !== '' ? ' · ' . seoEsc($about) : '') . '</p>'
        . (count($related) ? '<p><b>' . seoEsc($p['category'] ?? '') . '</b></p>' . seoSsrCards($related, $productPathFn, 8) : '');
    $html = seoInjectSsr($html, $inner);

} elseif ($categorySlug) {
    $categorySlug = strtolower(trim($categorySlug));
    $subcategorySlug = $subcategorySlug ? strtolower(trim($subcategorySlug)) : '';

    $category = null;
    foreach (seoPublishedCategories($publishedProducts) as $c) {
        if (seoSlugify($c) === $categorySlug) { $category = $c; break; }
    }
    if ($category === null && isset(SEO_LEGACY_CATEGORY_SLUGS[$categorySlug])) {
        // Old address: send people and search engines to today's category.
        header('Location: ' . SEO_SITE_URL . seoCategoryPath(SEO_LEGACY_CATEGORY_SLUGS[$categorySlug]), true, 301);
        exit;
    }

    $sub = null;
    if ($category !== null && $subcategorySlug !== '') {
        foreach (seoSubcategories($publishedProducts, $category) as $s) {
            if (seoSlugify($s) === $subcategorySlug) { $sub = $s; break; }
        }
    }

    if ($category === null) {
        $label = ucwords(str_replace('-', ' ', $categorySlug));
        $html = seoApplyHead($html, [
            'title' => $label . ' | ' . SEO_SITE_NAME, 'description' => seoHomeDescription($publishedProducts),
            'canonical' => SEO_SITE_URL . '/category/' . seoSlugify($categorySlug), 'robots' => 'noindex,follow',
            'ogType' => 'website', 'jsonLd' => [],
        ]);
    } else {
        $items = array_values(array_filter($publishedProducts, function ($x) use ($category, $sub) {
            return ($x['category'] ?? '') === $category && ($sub === null || ($x['subcategory'] ?? '') === $sub);
        }));
        $path = seoCategoryPath($category, $sub);
        $crumbs = [['name' => SEO_SITE_NAME, 'url' => SEO_SITE_URL . '/'], ['name' => $category, 'url' => SEO_SITE_URL . seoCategoryPath($category)]];
        if ($sub !== null) $crumbs[] = ['name' => $sub, 'url' => SEO_SITE_URL . $path];
        $listItems = [];
        foreach (array_slice($items, 0, 50) as $i => $x) {
            $listItems[] = ['@type' => 'ListItem', 'position' => $i + 1, 'url' => SEO_SITE_URL . $productPathFn($x), 'name' => seoCleanProductName($x['name'] ?? '')];
        }
        $html = seoApplyHead($html, [
            'title' => seoCategoryTitle($category, $sub),
            'description' => seoCategoryDescription($category, $sub, $items),
            'canonical' => SEO_SITE_URL . $path,
            'ogType' => 'website',
            'image' => count($items) ? seoProductImageUrl($items[0]) : SEO_OG_IMAGE,
            'jsonLd' => [
                'seo-ld-page' => [
                    '@context' => 'https://schema.org', '@type' => 'CollectionPage',
                    'name' => $sub !== null ? "{$sub} – {$category}" : $category,
                    'url' => SEO_SITE_URL . $path,
                    'isPartOf' => ['@type' => 'WebSite', 'name' => SEO_SITE_NAME, 'url' => SEO_SITE_URL],
                    'mainEntity' => ['@type' => 'ItemList', 'numberOfItems' => count($items), 'itemListElement' => $listItems],
                ],
                'seo-ld-breadcrumb' => seoBreadcrumb($crumbs),
            ],
        ]);

        $chips = '';
        foreach (seoSubcategories($publishedProducts, $category) as $s) {
            $chips .= '<a href="' . seoEsc(seoCategoryPath($category, $s)) . '">' . seoEsc($s) . '</a>';
        }
        $h1 = $sub !== null ? "{$sub} – {$category}" : $category;
        $inner = '<nav aria-label="Breadcrumb"><a href="/">' . SEO_SITE_NAME . '</a> / ' . ($sub !== null ? '<a href="' . seoEsc(seoCategoryPath($category)) . '">' . seoEsc($category) . '</a> / ' : '') . '</nav>'
            . '<h1>' . seoEsc($h1) . ' Price in Bangladesh</h1>'
            . ($chips !== '' ? '<div class="chips">' . $chips . '</div>' : '')
            . seoSsrCards($items, $productPathFn, 40);
        $html = seoInjectSsr($html, $inner);
    }

} elseif ($isOrderSuccessPage) {
    $html = seoApplyHead($html, [
        'title' => 'অর্ডার সম্পন্ন হয়েছে | ' . SEO_SITE_NAME, 'description' => 'আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে। ধন্যবাদ!',
        'canonical' => SEO_SITE_URL . '/order-success', 'robots' => 'noindex,nofollow', 'ogType' => 'website', 'jsonLd' => [],
    ]);

} else {
    // Home page, and any other address the app handles itself.
    $isHome = ($pathEarly === '/' || $pathEarly === '');
    $notFoundProduct = (bool)$productIdentifier;
    $html = seoApplyHead($html, [
        'title' => seoHomeTitle(),
        'description' => seoHomeDescription($publishedProducts),
        'canonical' => SEO_SITE_URL . '/',
        'robots' => ($isHome && !$notFoundProduct) ? SEO_DEFAULT_ROBOTS : 'noindex,follow',
        'ogType' => 'website',
        'jsonLd' => [],
    ]);
    if ($isHome) {
        $chips = '';
        foreach (seoPublishedCategories($publishedProducts) as $c) {
            $chips .= '<a href="' . seoEsc(seoCategoryPath($c)) . '">' . seoEsc($c) . '</a>';
        }
        $inner = '<h1>' . SEO_SITE_NAME . ' (আই শপ বিডি) – Online Shopping in Bangladesh</h1>'
            . '<div class="chips">' . $chips . '</div>'
            . seoSsrCards($publishedProducts, $productPathFn, 24);
        $html = seoInjectSsr($html, $inner);
    }
}

// Inject Initial Live Banners for Instant First Paint (Zero Old-Banner Flash)
$allBanners = getAllBannersCached();
if (!empty($allBanners)) {
    $cleanBannersJson = json_encode($allBanners, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $html = str_replace('</head>', "<script>window.__INITIAL_BANNERS__ = {$cleanBannersJson};</script></head>", $html);
}
// Inject Initial Cached Products for Instant Client-side Hydration
if (!empty($allProducts)) {
    $lightProducts = array_map(function($p) {
        $clean = $p;
        $pid = isset($clean['id']) ? $clean['id'] : '';
        if ($pid && !empty($clean['image']) && strpos($clean['image'], 'data:image') === 0) {
            foreach (['webp', 'jpg', 'png'] as $ext) {
                if (file_exists(__DIR__ . "/api/img_cache/{$pid}.{$ext}")) {
                    $clean['image'] = "/api/img_cache/{$pid}.{$ext}";
                    break;
                }
            }
        }
        if (!empty($clean['images']) && is_array($clean['images'])) {
            $cleanedImages = [];
            foreach ($clean['images'] as $idx => $img) {
                if (is_string($img) && strpos($img, 'data:image') === 0 && $pid) {
                    $found = false;
                    foreach (['webp', 'jpg', 'png'] as $ext) {
                        if (file_exists(__DIR__ . "/api/img_cache/{$pid}_idx{$idx}.{$ext}")) {
                            $cleanedImages[] = "/api/img_cache/{$pid}_idx{$idx}.{$ext}";
                            $found = true;
                            break;
                        }
                    }
                    if (!$found && $idx === 0) {
                        $cleanedImages[] = $clean['image'];
                    }
                } else {
                    $cleanedImages[] = $img;
                }
            }
            $clean['images'] = $cleanedImages;
        }
        if (isset($clean['description']) && strlen($clean['description']) > 1000) {
            $clean['description'] = mb_substr(strip_tags($clean['description']), 0, 500, 'UTF-8');
        }
        return $clean;
    }, $allProducts);

    $cleanJson = json_encode($lightProducts, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $html = str_replace('</head>', "<script>window.__INITIAL_PRODUCTS__ = {$cleanJson};</script></head>", $html);
}

echo $html;
