<?php
/**
 * Rokomari Ponno Hari - Dynamic Open Graph, Social Sharing & SEO Engine
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
    echo "<!DOCTYPE html><html><head><title>রকমারি পণ্য হাড়ি</title></head><body>index.html not found</body></html>";
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

$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'rokomariponnohari.com';
$baseUrl = "$protocol://$host";
$defaultOgImage = "$baseUrl/og-image.png";

// Helper function to fetch from Firestore REST API
function fetchFirestoreDoc($docId) {
    $url = "https://firestore.googleapis.com/v1/projects/rokomariponnohari-c6017/databases/(default)/documents/products/" . urlencode($docId);
    $response = null;
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'RokomariPonnoHari-OG-Bot/2.0');
        $response = curl_exec($ch);
        curl_close($ch);
    } else {
        $ctx = stream_context_create(array('http' => array('timeout' => 3, 'header' => "User-Agent: RokomariPonnoHari-OG-Bot/2.0\r\n")));
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

// Fast Path: Check if the request is from a Social Media Crawler or SEO Bot
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$isBot = (bool)preg_match('/(facebookexternalhit|Facebot|WhatsApp|Twitterbot|TelegramBot|Pinterest|LinkedInBot|Googlebot|bingbot|Baiduspider|YandexBot|Slackbot|Discordbot)/i', $userAgent);

// 1. Check for Product URL
$productIdentifier = isset($_GET['p']) ? $_GET['p'] : (isset($_GET['product']) ? $_GET['product'] : (isset($_GET['landing']) ? $_GET['landing'] : null));
if (!$productIdentifier) {
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    if (preg_match('~^/(?:product|p|landing)/([^/?#]+)~i', $uri, $matches)) {
        $productIdentifier = $matches[1];
    }
}

$productFields = null;
$resolvedProductId = null;

// Only fetch external Firestore REST API if it is a Social Media Bot or SEO Crawler
// Regular human visitors run React SPA and get instant 0.01s HTML response without server wait
if ($isBot && $productIdentifier) {
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
    $brand = isset($productFields['brand']['stringValue']) ? $productFields['brand']['stringValue'] : "রকমারি পণ্য হাড়ি";
    
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
        $cleanDesc = "$name - Buy authentic $brand products online at best price in Bangladesh from রকমারি পণ্য হাড়ি. Fast home delivery!";
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
    $html = preg_replace('/<title>[^<]*<\/title>/i', "<title>{$nameEscaped} - রকমারি পণ্য হাড়ি</title>", $html);
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
        if (preg_match('~^/(?:category|c)/([^/?#]+)~i', $uri, $catMatches)) {
            $categorySlug = $catMatches[1];
        }
    }

    if ($categorySlug) {
        $categorySlug = strtolower(trim($categorySlug));
        $catData = [
            "pure-honey" => [
                "title" => "খাঁটি মধু ও সুন্দরবনের চাকের মধু দাম | Pure Honey Price in BD - রকমারি পণ্য হাড়ি",
                "desc" => "১০০% খাঁটি ও প্রাকৃতিক সুন্দরবনের চাকের মধু কিনুন রকমারি পণ্য হাড়ি থেকে। ক্যাশ অন ডেলিভারিতে সারাদেশে দ্রুত হোম ডেলিভারি!",
                "kw" => "খাঁটি মধু, সুন্দরবনের মধু, মধু দাম বাংলাদেশ, raw honey, organic honey bd, pure honey bangladesh, rokomari ponno hari"
            ],
            "mustard-oil-ghee" => [
                "title" => "ঘানি ভাঙা সরিষার তেল ও খাঁটি গাওয়া ঘি | Pure Ghee & Mustard Oil - রকমারি পণ্য হাড়ি",
                "desc" => "কাঠের ঘানি ভাঙা ১০০% খাঁটি সরিষার তেল ও সুবাসিত দানাদার খাঁটি গাওয়া ঘি কিনুন রকমারি পণ্য হাড়ি থেকে। শতভাগ ভেজালমুক্ত নিশ্চয়তা।",
                "kw" => "সরিষার তেল, ঘানি ভাঙা তেল, খাঁটি ঘি, গাওয়া ঘি দাম, pure mustard oil bd, cow ghee, rokomari ponno hari, organic oil"
            ],
            "dates-dry-fruits" => [
                "title" => "মরিয়ম খেজুর ও প্রিমিয়াম ড্রাই ফ্রুটস | Maryam Dates & Dry Fruits - রকমারি পণ্য হাড়ি",
                "desc" => "মদিনার প্রিমিয়াম মরিয়ম খেজুর, আজওয়া খেজুর, কাজুবাদাম, কাঠবাদাম, আখরোট ও মিক্সড ড্রাই ফ্রুটস কিনুন সেরা দামে।",
                "kw" => "মরিয়ম খেজুর, খেজুরের দাম, কাজুবাদাম, কাঠবাদাম, ড্রাই ফ্রুটস, maryam dates, dry fruits bd, ajwa dates, rokomari ponno hari"
            ],
            "organic-seeds-oil" => [
                "title" => "অর্গানিক চিয়া সিড ও কালোজিরা তেল | Organic Chia Seeds & Black Seed Oil - রকমারি পণ্য হাড়ি",
                "desc" => "প্রিমিয়াম গ্রেড অর্গানিক চিয়া সিড এবং কোল্ড প্রেসড খাঁটি কালোজিরা তেল কিনুন সুলভ মূল্যে রকমারি পণ্য হাড়ি থেকে।",
                "kw" => "চিয়া সিড, কালোজিরা তেল, চিয়া সিডের দাম, chia seeds bd, black seed oil, organic seeds, rokomari ponno hari"
            ],
            "pure-spices" => [
                "title" => "খাঁটি পাহাড়ি মসলা ও গুঁড়া | Pure Spices in Bangladesh - রকমারি পণ্য হাড়ি",
                "desc" => "পাহাড়ি অঞ্চলের খাঁটি হলুদ, মরিচ ও ধনিয়া গুঁড়া কিনুন শতভাগ ভেজালমুক্ত নিশ্চয়তায় রকমারি পণ্য হাড়ি থেকে।",
                "kw" => "খাঁটি মসলা, হলুদ গুঁড়া, মরিচ গুঁড়া, organic spices bd, pure spices bangladesh, rokomari ponno hari"
            ],
            "organic-tea-herbal" => [
                "title" => "অর্গানিক চা ও ভেষজ পণ্য | Organic Tea & Herbal in BD - রকমারি পণ্য হাড়ি",
                "desc" => "প্রাকৃতিক অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ অর্গানিক গ্রিন টি ও ভেষজ খাদ্যপণ্য কিনুন রকমারি পণ্য হাড়ি থেকে।",
                "kw" => "অর্গানিক চা, গ্রিন টি, তুলসী চা, herbal tea bd, organic food bangladesh, rokomari ponno hari"
            ]
        ];

        $formattedName = ucwords(str_replace('-', ' ', $categorySlug));
        $catTitle = isset($catData[$categorySlug]['title']) ? $catData[$categorySlug]['title'] : "{$formattedName} Price in Bangladesh - রকমারি পণ্য হাড়ি";
        $catDesc = isset($catData[$categorySlug]['desc']) ? $catData[$categorySlug]['desc'] : "Buy authentic {$formattedName} online at the best price in Bangladesh from রকমারি পণ্য হাড়ি. Fast home delivery and warranty!";
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
        <h1>রকমারি পণ্য হাড়ি (Rokomari Ponno Hari) - ১০০% খাঁটি ও প্রাকৃতিক অর্গানিক খাদ্যপণ্যের অনলাইন শপ</h1>
        <p>রকমারি পণ্য হাড়ি (rokomariponnohari.com) হলো বাংলাদেশের বিশ্বস্ত অনলাইন অর্গানিক খাদ্যপণ্যের শপ। সেরা মূল্যে সুন্দরবনের প্রাকৃতিক চাকের খাঁটি মধু, কাঠের ঘানি ভাঙা সরিষার তেল, গাওয়া ঘি, প্রিমিয়াম মরিয়ম খেজুর, ড্রাই ফ্রুটস, চিয়া সিড, কালোজিরা তেল ও খাঁটি মসলা কিনুন ক্যাশ অন হোম ডেলিভারিতে।</p>
        <p>অফিসিয়াল ওয়েবসাইট: https://rokomariponnohari.com | ব্র্যান্ড: রকমারি পণ্য হাড়ি (Rokomari Ponno Hari)</p>
      </div>
';
        $html = str_replace('</body>', $homeCrawlerFallback . '</body>', $html);
    }
}

echo $html;
