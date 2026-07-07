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
                $description = "$name - Buy gadgets & electronics online at i SHOP BD.";
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
}

echo $html;
