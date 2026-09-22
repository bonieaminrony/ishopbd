<?php
/**
 * i SHOP BD - Dynamic Open Graph, Social Sharing & SEO Engine
 * Supports Facebook Crawler, Blogspot, WhatsApp, Twitter/X, and Googlebot
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

// Helper function to fetch from Firestore REST API
function fetchFirestoreDoc($docId) {
    $url = "https://firestore.googleapis.com/v1/projects/i-shop-bd/databases/(default)/documents/products/" . urlencode($docId);
    $response = null;
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'iShopBD-OG-Bot/2.0');
        $response = curl_exec($ch);
        curl_close($ch);
    } else {
        $ctx = stream_context_create(array('http' => array('timeout' => 3, 'header' => "User-Agent: iShopBD-OG-Bot/2.0\r\n")));
        $response = @file_get_contents($url, false, $ctx);
    }
    if ($response) {
        $data = json_decode($response, true);
        if (isset($data['fields'])) {
            return $data['fields'];
        }
    }
    return null;
}

// 1. Check for Product URL
$productIdentifier = isset($_GET['p']) ? $_GET['p'] : (isset($_GET['product']) ? $_GET['product'] : (isset($_GET['landing']) ? $_GET['landing'] : null));
if (!$productIdentifier) {
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    if (preg_match('#^/(?:product|p|landing)/([^/?#]+)#i', $uri, $matches)) {
        $productIdentifier = $matches[1];
    }
}

$productFields = null;
$resolvedProductId = null;

if ($productIdentifier) {
    $cleanIdent = trim((string)$productIdentifier);
    $parts = explode('-', $cleanIdent);
    $lastPart = end($parts);
    $candidateId = (strlen($lastPart) >= 6) ? $lastPart : $cleanIdent;

    // Try last part first
    $productFields = fetchFirestoreDoc($candidateId);
    if ($productFields) {
        $resolvedProductId = $candidateId;
    } elseif ($candidateId !== $cleanIdent) {
        // Fallback to full slug
        $productFields = fetchFirestoreDoc($cleanIdent);
        if ($productFields) {
            $resolvedProductId = $cleanIdent;
        }
    }
}

if ($productFields && $resolvedProductId) {
    $name = isset($productFields['name']['stringValue']) ? $productFields['name']['stringValue'] : "Product Details";
    $rawDesc = isset($productFields['description']['stringValue']) ? $productFields['description']['stringValue'] : "";
    $brand = isset($productFields['brand']['stringValue']) ? $productFields['brand']['stringValue'] : "i SHOP BD";
    
    $price = 0;
    if (isset($productFields['price'])) {
        $price = (float)($productFields['price']['integerValue'] ?? $productFields['price']['doubleValue'] ?? $productFields['price']['stringValue'] ?? 0);
    }

    $stockVal = 1;
    if (isset($productFields['stock'])) {
        $stockVal = (int)($productFields['stock']['integerValue'] ?? $productFields['stock']['doubleValue'] ?? $productFields['stock']['stringValue'] ?? 1);
    }
    $inStock = $stockVal > 0;

    // Clean description for meta tags
    $cleanDesc = trim(preg_replace('/[\r\n\t]+/', ' ', strip_tags($rawDesc)));
    $cleanDesc = str_replace('"', '&quot;', $cleanDesc);
    if (mb_strlen($cleanDesc) > 160) {
        $cleanDesc = mb_substr($cleanDesc, 0, 157) . "...";
    }
    if (empty($cleanDesc)) {
        $cleanDesc = "$name - Buy authentic $brand products online at best price in Bangladesh from i SHOP BD. Fast home delivery!";
    }

    // Resolve Image URL
    $imageUrl = $defaultOgImage;
    if (isset($productFields['image']['stringValue'])) {
        $imgStr = trim($productFields['image']['stringValue']);
        if (strpos($imgStr, 'http://') === 0 || strpos($imgStr, 'https://') === 0) {
            $imageUrl = $imgStr;
        } elseif (strpos($imgStr, 'data:image') === 0) {
            $imageUrl = "$baseUrl/api/product-image/" . urlencode($resolvedProductId);
        }
    }

    $safeSlug = preg_replace('/[^a-z0-9]+/i', '-', strtolower($name));
    $safeSlug = trim($safeSlug, '-');
    $currentUrl = "$baseUrl/product/$safeSlug-$resolvedProductId";

    // Clean attributes for injection
    $nameEscaped = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $descEscaped = htmlspecialchars($cleanDesc, ENT_QUOTES, 'UTF-8');
    $brandEscaped = htmlspecialchars($brand, ENT_QUOTES, 'UTF-8');
    $urlEscaped = htmlspecialchars($currentUrl, ENT_QUOTES, 'UTF-8');
    $imgEscaped = htmlspecialchars($imageUrl, ENT_QUOTES, 'UTF-8');

    // Product Schema JSON-LD
    $productSchema = [
        "@context" => "https://schema.org/",
        "@type" => "Product",
        "name" => $name,
        "image" => $imageUrl,
        "description" => $cleanDesc,
        "brand" => [
            "@type" => "Brand",
            "name" => $brand
        ],
        "offers" => [
            "@type" => "Offer",
            "url" => $currentUrl,
            "priceCurrency" => "BDT",
            "price" => $price,
            "availability" => $inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition" => "https://schema.org/NewCondition"
        ]
    ];

    // Meta replacement
    $html = preg_replace('/<title>[^<]*<\/title>/i', "<title>{$nameEscaped} - i SHOP BD</title>", $html);
    $html = preg_replace('/<meta name="description" content="[^"]*"\s*\/?>/i', "<meta name=\"description\" content=\"{$descEscaped}\" />", $html);

    // Canonical URL
    $html = str_replace('<!-- CANONICAL_URL_PLACEHOLDER -->', "<link rel=\"canonical\" href=\"{$urlEscaped}\" />", $html);

    // Open Graph
    $html = preg_replace('/<meta property="og:type" content="[^"]*"\s*\/?>/i', "<meta property=\"og:type\" content=\"product\" />", $html);
    $html = preg_replace('/<meta property="og:url" content="[^"]*"\s*\/?>/i', "<meta property=\"og:url\" content=\"{$urlEscaped}\" />", $html);
    $html = preg_replace('/<meta property="og:title" content="[^"]*"\s*\/?>/i', "<meta property=\"og:title\" content=\"{$nameEscaped}\" />", $html);
    $html = preg_replace('/<meta property="og:description" content="[^"]*"\s*\/?>/i', "<meta property=\"og:description\" content=\"{$descEscaped}\" />", $html);
    $html = preg_replace('/<meta property="og:image" content="[^"]*"\s*\/?>/i', "<meta property=\"og:image\" content=\"{$imgEscaped}\" /><meta property=\"og:image:secure_url\" content=\"{$imgEscaped}\" /><meta property=\"og:image:alt\" content=\"{$nameEscaped}\" />", $html);

    // Twitter Card
    $html = preg_replace('/<meta (?:name|property)="twitter:url" content="[^"]*"\s*\/?>/i', "<meta name=\"twitter:url\" content=\"{$urlEscaped}\" />", $html);
    $html = preg_replace('/<meta (?:name|property)="twitter:title" content="[^"]*"\s*\/?>/i', "<meta name=\"twitter:title\" content=\"{$nameEscaped}\" />", $html);
    $html = preg_replace('/<meta (?:name|property)="twitter:description" content="[^"]*"\s*\/?>/i', "<meta name=\"twitter:description\" content=\"{$descEscaped}\" />", $html);
    $html = preg_replace('/<meta (?:name|property)="twitter:image" content="[^"]*"\s*\/?>/i', "<meta name=\"twitter:image\" content=\"{$imgEscaped}\" />", $html);

    // Inject Schema JSON-LD
    $html = str_replace('</head>', '<script type="application/ld+json">' . json_encode($productSchema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script></head>', $html);

    // Inject Visible Fallback HTML for Web Crawlers (Blogspot, Facebook Crawler, Googlebot)
    $crawlerFallback = "
      <div id=\"seo-crawler-fallback\" style=\"position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden;\">
        <h1>{$nameEscaped}</h1>
        <p>{$descEscaped}</p>
        <p>দাম: ৳{$price} | ব্র্যান্ড: {$brandEscaped}</p>
        <img src=\"{$imgEscaped}\" alt=\"{$nameEscaped}\" />
      </div>
    ";
    $html = str_replace('<div id="root">', '<div id="root">' . $crawlerFallback, $html);

} else {
    // 2. Check for Category URL
    $categorySlug = isset($_GET['category']) ? $_GET['category'] : null;
    if (!$categorySlug) {
        $uri = $_SERVER['REQUEST_URI'] ?? '';
        if (preg_match('#^/(?:category|c)/([^/?#]+)#i', $uri, $catMatches)) {
            $categorySlug = $catMatches[1];
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

        $html = preg_replace('/<title>[^<]*<\/title>/i', "<title>{$titleEscaped}</title>", $html);
        $html = preg_replace('/<meta name="description" content="[^"]*"\s*\/?>/i', "<meta name=\"description\" content=\"{$descEscaped}\" />", $html);
        $html = preg_replace('/<meta name="keywords" content="[^"]*"\s*\/?>/i', "<meta name=\"keywords\" content=\"{$catKw}\" />", $html);

        $html = str_replace('<!-- CANONICAL_URL_PLACEHOLDER -->', "<link rel=\"canonical\" href=\"{$urlEscaped}\" />", $html);

        $html = preg_replace('/<meta property="og:url" content="[^"]*"\s*\/?>/i', "<meta property=\"og:url\" content=\"{$urlEscaped}\" />", $html);
        $html = preg_replace('/<meta property="og:title" content="[^"]*"\s*\/?>/i', "<meta property=\"og:title\" content=\"{$titleEscaped}\" />", $html);
        $html = preg_replace('/<meta property="og:description" content="[^"]*"\s*\/?>/i', "<meta property=\"og:description\" content=\"{$descEscaped}\" />", $html);
        $html = preg_replace('/<meta property="og:image" content="[^"]*"\s*\/?>/i', "<meta property=\"og:image\" content=\"{$imgEscaped}\" /><meta property=\"og:image:secure_url\" content=\"{$imgEscaped}\" />", $html);

        $html = preg_replace('/<meta (?:name|property)="twitter:url" content="[^"]*"\s*\/?>/i', "<meta name=\"twitter:url\" content=\"{$urlEscaped}\" />", $html);
        $html = preg_replace('/<meta (?:name|property)="twitter:title" content="[^"]*"\s*\/?>/i', "<meta name=\"twitter:title\" content=\"{$titleEscaped}\" />", $html);
        $html = preg_replace('/<meta (?:name|property)="twitter:description" content="[^"]*"\s*\/?>/i', "<meta name=\"twitter:description\" content=\"{$descEscaped}\" />", $html);
        $html = preg_replace('/<meta (?:name|property)="twitter:image" content="[^"]*"\s*\/?>/i', "<meta name=\"twitter:image\" content=\"{$imgEscaped}\" />", $html);
    } else {
        // Default Homepage
        $currentUrl = "$baseUrl" . ($_SERVER['REQUEST_URI'] ?? '/');
        $urlEscaped = htmlspecialchars($currentUrl, ENT_QUOTES, 'UTF-8');
        $imgEscaped = htmlspecialchars($defaultOgImage, ENT_QUOTES, 'UTF-8');

        $html = str_replace('<!-- CANONICAL_URL_PLACEHOLDER -->', "<link rel=\"canonical\" href=\"{$urlEscaped}\" />", $html);
        $html = preg_replace('/<meta property="og:url" content="[^"]*"\s*\/?>/i', "<meta property=\"og:url\" content=\"{$urlEscaped}\" />", $html);
        $html = preg_replace('/<meta property="og:image" content="[^"]*"\s*\/?>/i', "<meta property=\"og:image\" content=\"{$imgEscaped}\" /><meta property=\"og:image:secure_url\" content=\"{$imgEscaped}\" />", $html);
        $html = preg_replace('/<meta (?:name|property)="twitter:image" content="[^"]*"\s*\/?>/i', "<meta name=\"twitter:image\" content=\"{$imgEscaped}\" />", $html);

        // Inject Visible Fallback HTML for Web Crawlers (Googlebot, Bingbot)
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

// Inject Initial Cached Products for Instant Client-side Rendering (0ms latency, zero empty screens)
$productsCacheFile = __DIR__ . '/api/products_cache.json';
if (file_exists($productsCacheFile)) {
    $cachedProds = @file_get_contents($productsCacheFile);
    if ($cachedProds && strlen($cachedProds) > 10) {
        $cleanJson = trim($cachedProds);
        $html = str_replace('</head>', "<script>window.__INITIAL_PRODUCTS__ = {$cleanJson};</script></head>", $html);
    }
}

echo $html;
