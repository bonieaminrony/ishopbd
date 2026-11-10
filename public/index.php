<?php
/**
 * i SHOP BD - Dynamic Open Graph, Social Sharing & SEO SSR Engine
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
    if (!$categoryName) return "";
    $name = strtolower(trim((string)$categoryName));
    $map = [
        "charger fan" => "charger-fan",
        "power bank" => "power-bank",
        "smart watch" => "smart-watch",
        "headphone" => "headphone",
        "mobile accessories" => "mobile-accessories",
        "lifestyle & watch" => "lifestyle-watch",
        "lifestyle watch" => "lifestyle-watch",
        "electrical" => "charger-fan",
        "gadgets" => "mobile-accessories",
        "lifestyle" => "lifestyle-watch"
    ];
    if (isset($map[$name])) return $map[$name];
    return preg_replace('/[^a-z0-9]+/i', '-', $name);
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

// 1. Detect Product URL
$productIdentifier = isset($_GET['p']) ? $_GET['p'] : (isset($_GET['product']) ? $_GET['product'] : (isset($_GET['landing']) ? $_GET['landing'] : null));
if (!$productIdentifier) {
    $effectiveUri = getEffectiveRequestUri();
    $path = parse_url($effectiveUri, PHP_URL_PATH) ?: $effectiveUri;
    if (preg_match('~/(?:product|p|landing)/([^/?#]+)~i', $path, $matches)) {
        $productIdentifier = urldecode($matches[1]);
    }
}

$matchedProduct = null;
if ($productIdentifier) {
    $found = findProductInList($allProducts, $productIdentifier);
    if ($found && empty($found['deleted']) && (!isset($found['isPublished']) || $found['isPublished'] !== false)) {
        $matchedProduct = $found;
    }
}

if ($matchedProduct) {
    // ---- PRODUCT SSR ----
    $name = $matchedProduct['name'] ?: "Product Details";
    $rawDesc = $matchedProduct['description'] ?: "";
    $brand = $matchedProduct['brand'] ?: "i SHOP BD";
    $category = $matchedProduct['category'] ?: "";
    $price = (float)($matchedProduct['price'] ?? 0);
    $stockVal = (int)($matchedProduct['stock'] ?? 1);
    $inStock = $stockVal > 0;
    $rating = (float)($matchedProduct['rating'] ?? 5.0);
    $reviewCount = (int)($matchedProduct['reviewCount'] ?? 0);
    $resolvedId = $matchedProduct['id'];

    // Clean description for meta tags
    $cleanDesc = trim(preg_replace('/[\r\n\t]+/', ' ', strip_tags($rawDesc)));
    $cleanDesc = str_replace('"', '&quot;', $cleanDesc);
    if (mb_strlen($cleanDesc, 'UTF-8') > 160) {
        $cleanDesc = mb_substr($cleanDesc, 0, 157, 'UTF-8') . "...";
    }
    if (empty($cleanDesc)) {
        $cleanDesc = "$name - Buy authentic $brand products online at best price in Bangladesh from i SHOP BD. Fast cash on home delivery!";
    }

    // Resolve Image URL
    $imageUrl = $defaultOgImage;
    if (!empty($matchedProduct['image']) && is_string($matchedProduct['image'])) {
        $imgStr = trim($matchedProduct['image']);
        if (strpos($imgStr, 'http://') === 0 || strpos($imgStr, 'https://') === 0) {
            $imageUrl = $imgStr;
        } elseif (strpos($imgStr, '/api/product-image') === 0 || strpos($imgStr, '/uploads/') === 0) {
            $imageUrl = "$baseUrl" . $imgStr;
        } elseif (strpos($imgStr, 'data:image') === 0) {
            $imageUrl = "$baseUrl/api/product-image/" . urlencode($resolvedId);
        }
    }

    $canonicalSlug = getProductSlug($matchedProduct);
    $canonicalUrl = "$baseUrl/p/$canonicalSlug";
    $catSlug = !empty($category) ? getCategorySlug($category) : "";

    $nameEscaped = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $descEscaped = htmlspecialchars($cleanDesc, ENT_QUOTES, 'UTF-8');
    $brandEscaped = htmlspecialchars($brand, ENT_QUOTES, 'UTF-8');
    $urlEscaped = htmlspecialchars($canonicalUrl, ENT_QUOTES, 'UTF-8');
    $imgEscaped = htmlspecialchars($imageUrl, ENT_QUOTES, 'UTF-8');

    $currentYear = (int)gmdate('Y');
    $validFromDate = $currentYear . '-01-01';
    if (!empty($matchedProduct['createdAt']) && is_string($matchedProduct['createdAt'])) {
        if (preg_match('/^(\d{4}-\d{2}-\d{2})/', trim($matchedProduct['createdAt']), $dateMatches)) {
            $validFromDate = $dateMatches[1];
        } else {
            $parsedCreatedTs = strtotime($matchedProduct['createdAt']);
            if ($parsedCreatedTs !== false) {
                $validFromDate = gmdate('Y-m-d', $parsedCreatedTs);
            }
        }
    }
    $priceValidUntilDate = ($currentYear + 1) . '-12-31';
    $isFreeDelivery = !empty($matchedProduct['isFreeDelivery']);
    $prodWeight = isset($matchedProduct['weight']) ? (float)$matchedProduct['weight'] : 0.0;
    if ($isFreeDelivery) {
        $shippingRateBdt = 0;
    } elseif ($prodWeight <= 1.0) {
        $shippingRateBdt = 80;
    } else {
        $shippingRateBdt = 80 + ((int)ceil($prodWeight) - 1) * 20;
    }

    // Product Schema JSON-LD
    $productSchema = [
        "@context" => "https://schema.org/",
        "@type" => "Product",
        "name" => $name,
        "image" => [$imageUrl],
        "description" => $cleanDesc,
        "sku" => $resolvedId,
        "mpn" => !empty($matchedProduct['code']) ? $matchedProduct['code'] : $resolvedId,
        "brand" => [
            "@type" => "Brand",
            "name" => !empty($brand) ? $brand : "i SHOP BD"
        ],
        "offers" => [
            "@type" => "Offer",
            "url" => $canonicalUrl,
            "priceCurrency" => "BDT",
            "price" => $price,
            "validFrom" => $validFromDate,
            "priceValidUntil" => $priceValidUntilDate,
            "itemCondition" => "https://schema.org/NewCondition",
            "availability" => $inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller" => [
                "@type" => "Organization",
                "name" => "i SHOP BD"
            ],
            "shippingDetails" => [
                "@type" => "OfferShippingDetails",
                "shippingRate" => [
                    "@type" => "MonetaryAmount",
                    "value" => $shippingRateBdt,
                    "currency" => "BDT"
                ],
                "shippingDestination" => [
                    "@type" => "DefinedRegion",
                    "addressCountry" => "BD"
                ],
                "deliveryTime" => [
                    "@type" => "ShippingDeliveryTime",
                    "handlingTime" => [
                        "@type" => "QuantitativeValue",
                        "minValue" => 0,
                        "maxValue" => 1,
                        "unitCode" => "DAY"
                    ],
                    "transitTime" => [
                        "@type" => "QuantitativeValue",
                        "minValue" => 1,
                        "maxValue" => 3,
                        "unitCode" => "DAY"
                    ]
                ]
            ],
            "hasMerchantReturnPolicy" => [
                "@type" => "MerchantReturnPolicy",
                "applicableCountry" => "BD",
                "returnPolicyCategory" => "https://schema.org/MerchantReturnFiniteReturnWindow",
                "merchantReturnDays" => 7,
                "returnMethod" => "https://schema.org/ReturnByMail",
                "returnFees" => "https://schema.org/FreeReturn"
            ]
        ]
    ];

    if ($reviewCount > 0 && $rating > 0) {
        $productSchema["aggregateRating"] = [
            "@type" => "AggregateRating",
            "ratingValue" => $rating,
            "reviewCount" => $reviewCount
        ];
    }

    // BreadcrumbList Schema JSON-LD
    $breadcrumbItems = [
        [
            "@type" => "ListItem",
            "position" => 1,
            "name" => "Home",
            "item" => "$baseUrl/"
        ]
    ];
    if (!empty($category)) {
        $breadcrumbItems[] = [
            "@type" => "ListItem",
            "position" => 2,
            "name" => $category,
            "item" => "$baseUrl/category/$catSlug"
        ];
    }
    $breadcrumbItems[] = [
        "@type" => "ListItem",
        "position" => count($breadcrumbItems) + 1,
        "name" => $name,
        "item" => $canonicalUrl
    ];

    $productBreadcrumbSchema = [
        "@context" => "https://schema.org",
        "@type" => "BreadcrumbList",
        "itemListElement" => $breadcrumbItems
    ];

    // Meta tags injection
    $html = preg_replace('/<title>.*?<\/title>/is', "<title>{$nameEscaped} - i SHOP BD</title>", $html);
    $html = preg_replace('/<meta name="description" content="[^"]*"\s*\/?>/i', "<meta name=\"description\" content=\"{$descEscaped}\" />", $html);

    // Canonical URL
    if (strpos($html, '<!-- CANONICAL_URL_PLACEHOLDER -->') !== false) {
        $html = str_replace('<!-- CANONICAL_URL_PLACEHOLDER -->', "<link rel=\"canonical\" href=\"{$urlEscaped}\" />", $html);
    } else {
        $html = preg_replace('/<link rel="canonical" href="[^"]*"\s*\/?>/i', "<link rel=\"canonical\" href=\"{$urlEscaped}\" />", $html);
    }

    // Open Graph
    $html = preg_replace('/<meta property="og:type" content="[^"]*"\s*\/?>/i', "<meta property=\"og:type\" content=\"product\" />", $html);
    $html = preg_replace('/<meta property="og:url" content="[^"]*"\s*\/?>/i', "<meta property=\"og:url\" content=\"{$urlEscaped}\" />", $html);
    $html = preg_replace('/<meta property="og:title" content="[^"]*"\s*\/?>/i', "<meta property=\"og:title\" content=\"{$nameEscaped}\" />", $html);
    $html = preg_replace('/<meta property="og:description" content="[^"]*"\s*\/?>/i', "<meta property=\"og:description\" content=\"{$descEscaped}\" />", $html);
    $html = preg_replace('/<meta property="og:image" content="[^"]*"\s*\/?>/i', "<meta property=\"og:image\" content=\"{$imgEscaped}\" /><meta property=\"og:image:secure_url\" content=\"{$imgEscaped}\" /><meta property=\"og:image:alt\" content=\"{$nameEscaped}\" /><meta property=\"product:price:amount\" content=\"{$price}\" /><meta property=\"product:price:currency\" content=\"BDT\" />", $html);

    // Twitter
    $html = preg_replace('/<meta (?:name|property)="twitter:url" content="[^"]*"\s*\/?>/i', "<meta name=\"twitter:url\" content=\"{$urlEscaped}\" />", $html);
    $html = preg_replace('/<meta (?:name|property)="twitter:title" content="[^"]*"\s*\/?>/i', "<meta name=\"twitter:title\" content=\"{$nameEscaped}\" />", $html);
    $html = preg_replace('/<meta (?:name|property)="twitter:description" content="[^"]*"\s*\/?>/i', "<meta name=\"twitter:description\" content=\"{$descEscaped}\" />", $html);
    $html = preg_replace('/<meta (?:name|property)="twitter:image" content="[^"]*"\s*\/?>/i', "<meta name=\"twitter:image\" content=\"{$imgEscaped}\" />", $html);

    // Inject Schemas
    $schemasHtml = '<script type="application/ld+json">' . json_encode($productSchema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>' .
                   '<script type="application/ld+json">' . json_encode($productBreadcrumbSchema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
    $html = str_replace('</head>', $schemasHtml . '</head>', $html);

    // Semantic H1 and Crawlable Fallback HTML
    $catNavHtml = !empty($category) ? "<li><a href=\"/category/{$catSlug}\">{$category}</a></li>" : "";
    $availText = $inStock ? 'ইন স্টক (In Stock)' : 'স্টক আউট (Out of Stock)';
    $crawlerFallback = "
      <div id=\"seo-crawler-fallback\" style=\"position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden;\">
        <nav aria-label=\"Breadcrumb\">
          <ol>
            <li><a href=\"/\">Home</a></li>
            {$catNavHtml}
            <li>{$nameEscaped}</li>
          </ol>
        </nav>
        <h1>{$nameEscaped}</h1>
        <p>{$descEscaped}</p>
        <p>মূল্য: ৳" . number_format($price) . " BDT | ব্র্যান্ড: {$brandEscaped} | প্রাপ্যতা: {$availText}</p>
        <img src=\"{$imgEscaped}\" alt=\"{$nameEscaped}\" />
      </div>
    ";
    $html = str_replace('<div id="root">', '<div id="root">' . $crawlerFallback, $html);

} else {
    // 2. Detect Category URL
    $categorySlug = isset($_GET['category']) ? $_GET['category'] : (isset($_GET['c']) ? $_GET['c'] : null);
    if (!$categorySlug) {
        $effectiveUri = getEffectiveRequestUri();
        $path = parse_url($effectiveUri, PHP_URL_PATH) ?: $effectiveUri;
        if (preg_match('~/(?:category|c)/([^/?#]+)~i', $path, $catMatches)) {
            $categorySlug = urldecode($catMatches[1]);
        }
    }

    if ($categorySlug) {
        $categorySlug = strtolower(trim($categorySlug));
        $catData = [
            "charger-fan" => [
                "title" => "চার্জার ফ্যান ও মিনি ফ্যান দাম | Rechargeable Charger Fan Price in BD - i SHOP BD",
                "desc" => "সেরা দামে রিচার্জেবল চার্জার ফ্যান ও পোর্টেবল মিনি ফ্যান কিনুন i SHOP BD থেকে। হাই স্পিড ব্যাটারি ব্যাকআপ, ওয়ারেন্টি এবং দ্রুত হোম ডেলিভারি!",
                "kw" => "চার্জার ফ্যান, রিচার্জেবল ফ্যান, মিনি ফ্যান, portable fan, mini charger fan, hand fan, fan price in bangladesh, rechargeable table fan, ishopbd"
            ],
            "power-bank" => [
                "title" => "পাওয়ার ব্যাংক এর দাম | Best Power Bank Price in Bangladesh - i SHOP BD",
                "desc" => "সেরা দামে আসল পাওয়ার ব্যাংক (Power Bank) কিনুন i SHOP BD থেকে। 10000mAh, 20000mAh, 30000mAh ফাস্ট চার্জিং ও অফিসিয়াল ওয়ারেন্টি সহ হোম ডেলিভারি!",
                "kw" => "পাওয়ার ব্যাংক, power bank price in bd, 10000mah power bank, 20000mah fast charging power bank, portable mobile charger, reman, joyroom, anker, ishopbd"
            ],
            "smart-watch" => [
                "title" => "স্মার্ট ওয়াচ এর দাম | Smart Watch Price in Bangladesh - i SHOP BD",
                "desc" => "লেটেস্ট মডেলের স্মার্ট ওয়াচ কিনুন i SHOP BD থেকে। অ্যামোলেড ডিসপ্লে, ব্লুটুথ কলিং, হার্টরেট মনিটর ও দীর্ঘস্থায়ী ব্যাটারি ব্যাকআপ সহ সেরা অফার!",
                "kw" => "স্মার্ট ওয়াচ, smart watch price in bd, calling smart watch, amoled smartwatch, smartwatch bd, ishopbd"
            ],
            "headphone" => [
                "title" => "হেডফোন ও ব্লুটুথ ইয়ারবাডস | Headphone & Earbuds Price in BD - i SHOP BD",
                "desc" => "সেরা সাউন্ড কোয়ালিটি এবং অ্যাক্টিভ নয়েজ ক্যান্সেলেশন (ANC) হেডফোন ও ওয়্যারলেস ইয়ারবাডস কিনুন i SHOP BD থেকে। আকর্ষণীয় ডিসকাউন্ট ও ফাস্ট ডেলিভারি!",
                "kw" => "হেডফোন, ব্লুটুথ ইয়ারবাডস, earbuds price in bd, wireless headphones, tws airpods bd, gaming headphone, ishopbd"
            ],
            "mobile-accessories" => [
                "title" => "মোবাইল এক্সেসরিজ ও গ্যাজেট | Mobile Accessories in Bangladesh - i SHOP BD",
                "desc" => "সব ধরনের প্রিমিয়াম মোবাইল এক্সেসরিজ, ফাস্ট চার্জার, কেবল, ট্রাইপড ও ট্রিপড মাউন্ট কিনুন সেরা মূল্যে i SHOP BD থেকে।",
                "kw" => "মোবাইল এক্সেসরিজ, mobile accessories bd, fast charger, usb cable, phone tripod, microphone, ishopbd"
            ],
            "lifestyle-watch" => [
                "title" => "লাইফস্টাইল গ্যাজেট ও ঘড়ি | Lifestyle & Watches in BD - i SHOP BD",
                "desc" => "আধুনিক লাইফস্টাইল গ্যাজেট ও ট্রেন্ডি ঘড়ির বিশাল কালেকশন কিনুন i SHOP BD থেকে। দ্রুত হোম ডেলিভারি ও শতভাগ আসল পণ্যের গ্যারান্টি।",
                "kw" => "লাইফস্টাইল গ্যাজেট, ঘড়ি, watches in bd, lifestyle accessories, ishopbd"
            ]
        ];

        $formattedName = ucwords(str_replace('-', ' ', $categorySlug));
        $catTitle = isset($catData[$categorySlug]['title']) ? $catData[$categorySlug]['title'] : "{$formattedName} Price in Bangladesh - i SHOP BD";
        $catDesc = isset($catData[$categorySlug]['desc']) ? $catData[$categorySlug]['desc'] : "Buy authentic {$formattedName} online at the best price in Bangladesh from i SHOP BD. Fast home delivery and warranty!";
        $catKw = isset($catData[$categorySlug]['kw']) ? $catData[$categorySlug]['kw'] : "{$categorySlug}, buy {$categorySlug} bd, ishopbd";
        $catUrl = "$baseUrl/category/$categorySlug";

        $titleEscaped = htmlspecialchars($catTitle, ENT_QUOTES, 'UTF-8');
        $descEscaped = htmlspecialchars($catDesc, ENT_QUOTES, 'UTF-8');
        $urlEscaped = htmlspecialchars($catUrl, ENT_QUOTES, 'UTF-8');
        $imgEscaped = htmlspecialchars($defaultOgImage, ENT_QUOTES, 'UTF-8');

        // Meta tags
        $html = preg_replace('/<title>.*?<\/title>/is', "<title>{$titleEscaped}</title>", $html);
        $html = preg_replace('/<meta name="description" content="[^"]*"\s*\/?>/i', "<meta name=\"description\" content=\"{$descEscaped}\" />", $html);
        $html = preg_replace('/<meta name="keywords" content="[^"]*"\s*\/?>/i', "<meta name=\"keywords\" content=\"{$catKw}\" />", $html);

        // Canonical URL
        if (strpos($html, '<!-- CANONICAL_URL_PLACEHOLDER -->') !== false) {
            $html = str_replace('<!-- CANONICAL_URL_PLACEHOLDER -->', "<link rel=\"canonical\" href=\"{$urlEscaped}\" />", $html);
        } else {
            $html = preg_replace('/<link rel="canonical" href="[^"]*"\s*\/?>/i', "<link rel=\"canonical\" href=\"{$urlEscaped}\" />", $html);
        }

        // Open Graph
        $html = preg_replace('/<meta property="og:url" content="[^"]*"\s*\/?>/i', "<meta property=\"og:url\" content=\"{$urlEscaped}\" />", $html);
        $html = preg_replace('/<meta property="og:title" content="[^"]*"\s*\/?>/i', "<meta property=\"og:title\" content=\"{$titleEscaped}\" />", $html);
        $html = preg_replace('/<meta property="og:description" content="[^"]*"\s*\/?>/i', "<meta property=\"og:description\" content=\"{$descEscaped}\" />", $html);
        $html = preg_replace('/<meta property="og:image" content="[^"]*"\s*\/?>/i', "<meta property=\"og:image\" content=\"{$imgEscaped}\" /><meta property=\"og:image:secure_url\" content=\"{$imgEscaped}\" />", $html);

        // Twitter
        $html = preg_replace('/<meta (?:name|property)="twitter:url" content="[^"]*"\s*\/?>/i', "<meta name=\"twitter:url\" content=\"{$urlEscaped}\" />", $html);
        $html = preg_replace('/<meta (?:name|property)="twitter:title" content="[^"]*"\s*\/?>/i', "<meta name=\"twitter:title\" content=\"{$titleEscaped}\" />", $html);
        $html = preg_replace('/<meta (?:name|property)="twitter:description" content="[^"]*"\s*\/?>/i', "<meta name=\"twitter:description\" content=\"{$descEscaped}\" />", $html);
        $html = preg_replace('/<meta (?:name|property)="twitter:image" content="[^"]*"\s*\/?>/i', "<meta name=\"twitter:image\" content=\"{$imgEscaped}\" />", $html);

        // Filter Category Products
        $categoryProducts = [];
        foreach ($allProducts as $prod) {
            if (!empty($prod['deleted']) || (isset($prod['isPublished']) && $prod['isPublished'] === false)) continue;
            $pCat = strtolower(getCategorySlug($prod['category'] ?? ''));
            if ($pCat === $categorySlug || strpos($pCat, $categorySlug) !== false || strpos($categorySlug, $pCat) !== false) {
                $categoryProducts[] = $prod;
            }
        }

        // Category Schemas
        $categorySchema = [
            "@context" => "https://schema.org",
            "@type" => "CollectionPage",
            "name" => $catTitle,
            "description" => $catDesc,
            "url" => $catUrl,
            "image" => $defaultOgImage,
            "mainEntity" => [
                "@type" => "ItemList",
                "numberOfItems" => count($categoryProducts),
                "itemListElement" => array_map(function($p, $idx) use ($baseUrl) {
                    $pSlug = getProductSlug($p);
                    $pId = $p['id'] ?? '';
                    $pImg = !empty($p['image']) && strpos($p['image'], 'data:') === false ? $p['image'] : "$baseUrl/api/product-image/{$pId}";
                    if (strpos($pImg, 'http') !== 0) $pImg = "$baseUrl$pImg";
                    return [
                        "@type" => "ListItem",
                        "position" => $idx + 1,
                        "url" => "$baseUrl/p/{$pSlug}",
                        "name" => $p['name'] ?? '',
                        "image" => $pImg
                    ];
                }, $categoryProducts, array_keys($categoryProducts))
            ]
        ];

        $catBreadcrumbSchema = [
            "@context" => "https://schema.org",
            "@type" => "BreadcrumbList",
            "itemListElement" => [
                [
                    "@type" => "ListItem",
                    "position" => 1,
                    "name" => "Home",
                    "item" => "$baseUrl/"
                ],
                [
                    "@type" => "ListItem",
                    "position" => 2,
                    "name" => $formattedName,
                    "item" => $catUrl
                ]
            ]
        ];

        $schemasHtml = '<script type="application/ld+json">' . json_encode($categorySchema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>' .
                       '<script type="application/ld+json">' . json_encode($catBreadcrumbSchema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
        $html = str_replace('</head>', $schemasHtml . '</head>', $html);

        // Category Crawlable Fallback HTML
        $catFallback = "<div id=\"seo-category-fallback\" style=\"position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden;\">";
        $catFallback .= "<nav aria-label=\"Breadcrumb\"><ol><li><a href=\"/\">Home</a></li><li>{$formattedName}</li></ol></nav>";
        $catFallback .= "<h1>{$titleEscaped}</h1><p>{$descEscaped}</p><ul>";
        foreach (array_slice($categoryProducts, 0, 25) as $cp) {
            $cpName = htmlspecialchars($cp['name'] ?? '', ENT_QUOTES, 'UTF-8');
            $cpPrice = $cp['price'] ?? 0;
            $cpSlug = getProductSlug($cp);
            $catFallback .= "<li><a href=\"/p/{$cpSlug}\">{$cpName} - ৳" . number_format($cpPrice) . "</a></li>";
        }
        $catFallback .= "</ul></div>";
        $html = str_replace('<div id="root">', '<div id="root">' . $catFallback, $html);

    } else {
        // 3. Homepage Default
        $currentUrl = "$baseUrl/";
        $urlEscaped = htmlspecialchars($currentUrl, ENT_QUOTES, 'UTF-8');
        $imgEscaped = htmlspecialchars($defaultOgImage, ENT_QUOTES, 'UTF-8');

        if (strpos($html, '<!-- CANONICAL_URL_PLACEHOLDER -->') !== false) {
            $html = str_replace('<!-- CANONICAL_URL_PLACEHOLDER -->', "<link rel=\"canonical\" href=\"{$urlEscaped}\" />", $html);
        } else {
            $html = preg_replace('/<link rel="canonical" href="[^"]*"\s*\/?>/i', "<link rel=\"canonical\" href=\"{$urlEscaped}\" />", $html);
        }

        $html = preg_replace('/<meta property="og:url" content="[^"]*"\s*\/?>/i', "<meta property=\"og:url\" content=\"{$urlEscaped}\" />", $html);
        $html = preg_replace('/<meta property="og:image" content="[^"]*"\s*\/?>/i', "<meta property=\"og:image\" content=\"{$imgEscaped}\" /><meta property=\"og:image:secure_url\" content=\"{$imgEscaped}\" />", $html);
        $html = preg_replace('/<meta (?:name|property)="twitter:image" content="[^"]*"\s*\/?>/i', "<meta name=\"twitter:image\" content=\"{$imgEscaped}\" />", $html);

        // Home Crawlable Fallback
        $homeCrawlerFallback = '
      <div id="seo-crawler-fallback" style="position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden;">
        <h1>i SHOP BD (আই শপ বিডি) - Online Gadgets & Electronics Store in Bangladesh</h1>
        <p>i SHOP BD (ishopbd.com) হলো বাংলাদেশের বিশ্বস্ত অনলাইন গ্যাজেট এবং লাইফস্টাইল ই-কমার্স শপ। সেরা মূল্যে Wireless Microphone (DJI, Boya, Hollyland, Ulanzi), Fast Charging Power Bank, Rechargeable Fan, Smart Watch, Headphone ও এক্সেসরিজ কিনুন ক্যাশ অন হোম ডেলিভারিতে।</p>
        <p>অফিসিয়াল ওয়েবসাইট: https://ishopbd.com | ব্র্যান্ড: i SHOP BD (ishopbd)</p>
      </div>
';
        $html = str_replace('</body>', $homeCrawlerFallback . '</body>', $html);
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
    $cleanJson = json_encode($allProducts, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $html = str_replace('</head>', "<script>window.__INITIAL_PRODUCTS__ = {$cleanJson};</script></head>", $html);
}

echo $html;
