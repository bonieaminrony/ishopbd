<?php

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("X-LiteSpeed-Cache-Control: no-cache");

$htmlPath = __DIR__ . '/index.html';
if (!file_exists($htmlPath)) {
    echo "index.html not found";
    exit;
}

$html = file_get_contents($htmlPath);
$productId = isset($_GET['p']) ? $_GET['p'] : (isset($_GET['product']) ? $_GET['product'] : null);
if (!$productId && isset($_GET['landing'])) {
    $productId = $_GET['landing'];
}
if (!$productId) {
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    if (preg_match('#^/(?:product|p|landing)/([^/?]+)#', $uri, $matches)) {
        $slug = $matches[1];
        $parts = explode('-', $slug);
        $last = end($parts);
        $productId = (strlen($last) >= 6) ? $last : $slug;
    }
}

if ($productId) {
    $url = "https://firestore.googleapis.com/v1/projects/i-shop-bd/databases/(default)/documents/products/" . urlencode($productId);
    $ctx = stream_context_create(array('http' => array('timeout' => 4)));
    $response = @file_get_contents($url, false, $ctx);
    
    if ($response) {
        $data = json_decode($response, true);
        if (isset($data['fields'])) {
            $name = isset($data['fields']['name']['stringValue']) ? $data['fields']['name']['stringValue'] : "Product Details";
            $description = isset($data['fields']['description']['stringValue']) ? $data['fields']['description']['stringValue'] : "";
            
            $description = trim(preg_replace('/[\r\n]+/', ' ', $description));
            $description = str_replace('"', '&quot;', $description);
            if (mb_strlen($description) > 150) {
                $description = mb_substr($description, 0, 147) . "...";
            }
            if (empty($description)) {
                $description = "$name - Buy gadgets & lifestyle accessories online at i SHOP BD.";
            }
            
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
            if (isset($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
                $protocol = $_SERVER['HTTP_X_FORWARDED_PROTO'];
            }
            $host = $_SERVER['HTTP_HOST'];
            $currentUrl = "$protocol://$host" . $_SERVER['REQUEST_URI'];
            $imageUrl = "$protocol://$host/api/product-image/" . urlencode($productId);
            
            $name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
            $description = htmlspecialchars($description, ENT_QUOTES, 'UTF-8');
            $currentUrl = htmlspecialchars($currentUrl, ENT_QUOTES, 'UTF-8');
            
            // Inject tags using regex (similar to server.ts)
            $html = preg_replace('/<title>[^<]*<\/title>/i', "<title>{$name} - i SHOP BD</title>", $html);
            $html = preg_replace('/<meta name="description" content="[^"]*"\s*\/?>/i', "<meta name=\"description\" content=\"{$description}\" />", $html);
            
            $html = preg_replace('/<meta property="og:url" content="[^"]*"\s*\/?>/i', "<meta property=\"og:url\" content=\"{$currentUrl}\" />", $html);
            $html = preg_replace('/<meta property="og:title" content="[^"]*"\s*\/?>/i', "<meta property=\"og:title\" content=\"{$name}\" />", $html);
            $html = preg_replace('/<meta property="og:description" content="[^"]*"\s*\/?>/i', "<meta property=\"og:description\" content=\"{$description}\" />", $html);
            $html = preg_replace('/<meta property="og:image" content="[^"]*"\s*\/?>/i', "<meta property=\"og:image\" content=\"{$imageUrl}\" />", $html);
            
            $html = preg_replace('/<meta property="twitter:url" content="[^"]*"\s*\/?>/i', "<meta property=\"twitter:url\" content=\"{$currentUrl}\" />", $html);
            $html = preg_replace('/<meta property="twitter:title" content="[^"]*"\s*\/?>/i', "<meta property=\"twitter:title\" content=\"{$name}\" />", $html);
            $html = preg_replace('/<meta property="twitter:description" content="[^"]*"\s*\/?>/i', "<meta property=\"twitter:description\" content=\"{$description}\" />", $html);
            $html = preg_replace('/<meta property="twitter:image" content="[^"]*"\s*\/?>/i', "<meta property=\"twitter:image\" content=\"{$imageUrl}\" />", $html);
        }
    }
} else {
    $categorySlug = isset($_GET['category']) ? $_GET['category'] : null;
    if (!$categorySlug) {
        $uri = $_SERVER['REQUEST_URI'] ?? '';
        if (preg_match('#^/(?:category|c)/([^/?]+)#', $uri, $catMatches)) {
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
        $title = isset($catData[$categorySlug]['title']) ? $catData[$categorySlug]['title'] : "{$formattedName} Price in Bangladesh - i SHOP BD";
        $description = isset($catData[$categorySlug]['desc']) ? $catData[$categorySlug]['desc'] : "Buy authentic {$formattedName} online at the best price in Bangladesh from i SHOP BD. Fast home delivery and warranty!";
        $keywords = isset($catData[$categorySlug]['kw']) ? $catData[$categorySlug]['kw'] : "{$categorySlug}, buy {$categorySlug} bd, ishopbd";
        
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
        if (isset($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
            $protocol = $_SERVER['HTTP_X_FORWARDED_PROTO'];
        }
        $host = $_SERVER['HTTP_HOST'];
        $currentUrl = "$protocol://$host/category/$categorySlug";
        $imageUrl = "$protocol://$host/logo.png";
        
        $html = preg_replace('/<title>[^<]*<\/title>/i', "<title>{$title}</title>", $html);
        $html = preg_replace('/<meta name="description" content="[^"]*"\s*\/?>/i', "<meta name=\"description\" content=\"{$description}\" />", $html);
        $html = preg_replace('/<meta name="keywords" content="[^"]*"\s*\/?>/i', "<meta name=\"keywords\" content=\"{$keywords}\" />", $html);
        
        $html = preg_replace('/<meta property="og:url" content="[^"]*"\s*\/?>/i', "<meta property=\"og:url\" content=\"{$currentUrl}\" />", $html);
        $html = preg_replace('/<meta property="og:title" content="[^"]*"\s*\/?>/i', "<meta property=\"og:title\" content=\"{$title}\" />", $html);
        $html = preg_replace('/<meta property="og:description" content="[^"]*"\s*\/?>/i', "<meta property=\"og:description\" content=\"{$description}\" />", $html);
        $html = preg_replace('/<meta property="og:image" content="[^"]*"\s*\/?>/i', "<meta property=\"og:image\" content=\"{$imageUrl}\" />", $html);
        
        $html = preg_replace('/<meta property="twitter:url" content="[^"]*"\s*\/?>/i', "<meta property=\"twitter:url\" content=\"{$currentUrl}\" />", $html);
        $html = preg_replace('/<meta property="twitter:title" content="[^"]*"\s*\/?>/i', "<meta property=\"twitter:title\" content=\"{$title}\" />", $html);
        $html = preg_replace('/<meta property="twitter:description" content="[^"]*"\s*\/?>/i', "<meta property=\"twitter:description\" content=\"{$description}\" />", $html);
        $html = preg_replace('/<meta property="twitter:image" content="[^"]*"\s*\/?>/i', "<meta property=\"twitter:image\" content=\"{$imageUrl}\" />", $html);
    }
}

echo $html;
