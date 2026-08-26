<?php
/**
 * i SHOP BD - Fast Cached Products API
 * Provides rapid product delivery for mobile browsers and SPAs
 */

$allowedOrigins = [
    'https://rokomariponnohari.com',
    'https://www.rokomariponnohari.com',
    'https://rokomariponnohari.com',
    'https://www.rokomariponnohari.com',
    'http://localhost:5173',
    'http://localhost:3000',
];
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: https://rokomariponnohari.com");
}
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: public, max-age=60, stale-while-revalidate=300");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

$cacheFile = __DIR__ . '/products_cache.json';
$cacheTime = 60; // 1 minute server cache

if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
    readfile($cacheFile);
    exit(0);
}

$url = "https://firestore.googleapis.com/v1/projects/rokomariponnohari-c6017/databases/(default)/documents/products?pageSize=300";
$response = null;

if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 4);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    curl_close($ch);
} else {
    $ctx = stream_context_create(array('http' => array('timeout' => 4)));
    $response = @file_get_contents($url, false, $ctx);
}

$products = [];

if ($response) {
    $data = json_decode($response, true);
    if (isset($data['documents']) && is_array($data['documents'])) {
        foreach ($data['documents'] as $doc) {
            $pathParts = explode('/', $doc['name']);
            $id = end($pathParts);
            $fields = $doc['fields'] ?? [];

            if (!empty($fields['deleted']['booleanValue'])) {
                continue;
            }

            $product = [
                'id' => $id,
                'name' => $fields['name']['stringValue'] ?? '',
                'price' => (float)($fields['price']['integerValue'] ?? $fields['price']['doubleValue'] ?? $fields['price']['stringValue'] ?? 0),
                'originalPrice' => (float)($fields['originalPrice']['integerValue'] ?? $fields['originalPrice']['doubleValue'] ?? $fields['originalPrice']['stringValue'] ?? 0),
                'description' => $fields['description']['stringValue'] ?? '',
                'category' => $fields['category']['stringValue'] ?? '',
                'subcategory' => $fields['subcategory']['stringValue'] ?? '',
                'brand' => $fields['brand']['stringValue'] ?? '',
                'image' => $fields['image']['stringValue'] ?? '',
                'stock' => (int)($fields['stock']['integerValue'] ?? $fields['stock']['doubleValue'] ?? $fields['stock']['stringValue'] ?? 0),
                'isPublished' => $fields['isPublished']['booleanValue'] ?? true,
                'isFlashSale' => $fields['isFlashSale']['booleanValue'] ?? false,
                'flashSalePrice' => (float)($fields['flashSalePrice']['integerValue'] ?? $fields['flashSalePrice']['doubleValue'] ?? 0),
                'flashSaleEndDate' => $fields['flashSaleEndDate']['stringValue'] ?? '',
                'rating' => (float)($fields['rating']['doubleValue'] ?? $fields['rating']['integerValue'] ?? 5),
                'reviewsCount' => (int)($fields['reviewsCount']['integerValue'] ?? 0),
                'slug' => $fields['slug']['stringValue'] ?? ''
            ];

            if (isset($fields['images']['arrayValue']['values'])) {
                $product['images'] = array_map(function($v) {
                    return $v['stringValue'] ?? '';
                }, $fields['images']['arrayValue']['values']);
            }

            if (isset($fields['variants']['arrayValue']['values'])) {
                $product['variants'] = array_map(function($v) {
                    $m = $v['mapValue']['fields'] ?? [];
                    return [
                        'color' => $m['color']['stringValue'] ?? '',
                        'size' => $m['size']['stringValue'] ?? '',
                        'stock' => (int)($m['stock']['integerValue'] ?? 0),
                        'price' => (float)($m['price']['integerValue'] ?? $m['price']['doubleValue'] ?? 0),
                    ];
                }, $fields['variants']['arrayValue']['values']);
            }

            $products[] = $product;
        }
    }
}

$jsonOutput = json_encode($products, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

if (count($products) > 0) {
    @file_put_contents($cacheFile, $jsonOutput);
}

echo $jsonOutput;
