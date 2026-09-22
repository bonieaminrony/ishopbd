<?php
/**
 * i SHOP BD - Ultra-Fast Lean Products API
 * Provides rapid compressed product delivery for mobile browsers and SPAs
 * Strips heavy Base64 strings and redirects to cached binary image proxy
 */

if (!ob_start("ob_gzhandler")) {
    ob_start();
}

$allowedOrigins = [
    'https://ishopbd.com',
    'https://www.ishopbd.com',
    'https://ishopbd.online',
    'https://www.ishopbd.online',
    'http://localhost:5173',
    'http://localhost:3000',
];
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: https://ishopbd.com");
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
$cacheTime = 300; // 5 minutes fresh cache

// 1. If fresh cache exists on disk, serve it immediately with ETag support
if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
    $etag = '"' . md5_file($cacheFile) . '"';
    header("ETag: $etag");
    if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag) {
        http_response_code(304);
        exit(0);
    }
    $cachedData = @file_get_contents($cacheFile);
    if ($cachedData && strlen($cachedData) > 10) {
        echo $cachedData;
        exit(0);
    }
}

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

function parseFirestoreDoc($doc) {
    $pathParts = explode('/', $doc['name'] ?? '');
    $id = end($pathParts);
    $fields = $doc['fields'] ?? [];
    
    $product = ['id' => $id];
    foreach ($fields as $key => $val) {
        if ($key === 'landingConfig') continue; // Strip huge landing configs from catalog list
        $product[$key] = parseFirestoreValue($val);
    }
    
    // Convert Base64 primary image to lightweight URL proxy
    if (!empty($product['image']) && is_string($product['image']) && strpos($product['image'], 'data:image/') === 0) {
        $product['image'] = "/api/product-image/{$id}";
    }
    
    // Convert Base64 gallery images to lightweight URL proxies
    if (!empty($product['images']) && is_array($product['images'])) {
        foreach ($product['images'] as $idx => $img) {
            if (is_string($img) && strpos($img, 'data:image/') === 0) {
                $product['images'][$idx] = "/api/product-image/{$id}?idx={$idx}";
            }
        }
    }

    // Convert Base64 variant images
    if (!empty($product['variants']) && is_array($product['variants'])) {
        foreach ($product['variants'] as $vIdx => $variant) {
            if (is_array($variant) && !empty($variant['image']) && strpos($variant['image'], 'data:image/') === 0) {
                $product['variants'][$vIdx]['image'] = "/api/product-image/{$id}";
            }
        }
    }

    // Ensure numerical types and expected defaults
    $product['price'] = isset($product['price']) ? (float)$product['price'] : 0.0;
    $product['originalPrice'] = isset($product['originalPrice']) ? (float)$product['originalPrice'] : (float)($product['price'] ?? 0);
    $product['discount'] = isset($product['discount']) ? (float)$product['discount'] : 0.0;
    $product['stock'] = isset($product['stock']) ? (int)$product['stock'] : 0;
    $product['isPublished'] = isset($product['isPublished']) ? (bool)$product['isPublished'] : true;
    $product['isTrending'] = isset($product['isTrending']) ? (bool)$product['isTrending'] : false;
    $product['isFlashSale'] = isset($product['isFlashSale']) ? (bool)$product['isFlashSale'] : false;
    $product['isFreeDelivery'] = isset($product['isFreeDelivery']) ? (bool)$product['isFreeDelivery'] : false;
    $product['name'] = $product['name'] ?? '';
    $product['category'] = $product['category'] ?? '';
    $product['subcategory'] = $product['subcategory'] ?? '';
    $product['brand'] = $product['brand'] ?? '';
    $product['image'] = $product['image'] ?? '';
    $product['description'] = $product['description'] ?? '';
    $product['slug'] = $product['slug'] ?? '';
    $product['rating'] = isset($product['rating']) ? (float)$product['rating'] : 5.0;
    $product['reviewCount'] = isset($product['reviewCount']) ? (int)$product['reviewCount'] : (isset($product['reviewsCount']) ? (int)$product['reviewsCount'] : 0);
    $product['likes'] = isset($product['likes']) ? (int)$product['likes'] : 0;
    
    return $product;
}

// 2. Fetch from Firestore
$apiKey = getenv('VITE_FIREBASE_API_KEY') ?: 'AIzaSyClPZu-7eztcpTyOT0vVWX-znIwouTg7I8';
$rawDocs = [];

// Primary Method: documents:runQuery (Single fast roundtrip fetching complete collection)
$runQueryUrl = "https://firestore.googleapis.com/v1/projects/i-shop-bd/databases/(default)/documents:runQuery?key=" . urlencode($apiKey);

if (function_exists('curl_init')) {
    $ch = curl_init($runQueryUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['structuredQuery' => ['from' => [['collectionId' => 'products']]]]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Referer: https://ishopbd.com/']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 12);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $items = json_decode($response, true);
        if (is_array($items)) {
            foreach ($items as $item) {
                if (isset($item['document']) && is_array($item['document'])) {
                    $rawDocs[] = $item['document'];
                }
            }
        }
    }
}

// Fallback Method: Multi-page collection fetch with nextPageToken loop
if (empty($rawDocs)) {
    $pageToken = null;
    $pageCount = 0;
    do {
        $pageCount++;
        $url = "https://firestore.googleapis.com/v1/projects/i-shop-bd/databases/(default)/documents/products?key=" . urlencode($apiKey) . "&pageSize=100";
        if ($pageToken) {
            $url .= "&pageToken=" . urlencode($pageToken);
        }
        $pageToken = null;

        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_USERAGENT, 'iShopBD-Products-API/2.0');
            $res = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            if ($code === 200 && $res) {
                $data = json_decode($res, true);
                if (isset($data['documents']) && is_array($data['documents'])) {
                    foreach ($data['documents'] as $doc) {
                        $rawDocs[] = $doc;
                    }
                }
                if (!empty($data['nextPageToken'])) {
                    $pageToken = $data['nextPageToken'];
                }
            }
        } else {
            $ctx = stream_context_create(array('http' => array('timeout' => 10, 'header' => "User-Agent: iShopBD-Products-API/2.0\r\n")));
            $res = @file_get_contents($url, false, $ctx);
            if ($res) {
                $data = json_decode($res, true);
                if (isset($data['documents']) && is_array($data['documents'])) {
                    foreach ($data['documents'] as $doc) {
                        $rawDocs[] = $doc;
                    }
                }
                if (!empty($data['nextPageToken'])) {
                    $pageToken = $data['nextPageToken'];
                }
            }
        }
    } while ($pageToken && $pageCount < 10);
}

$products = [];
if (!empty($rawDocs)) {
    foreach ($rawDocs as $doc) {
        $parsed = parseFirestoreDoc($doc);
        if (!empty($parsed['deleted'])) {
            continue;
        }
        $products[] = $parsed;
    }
}

// 3. If fetched products successfully, update disk cache and return with ETag
if (count($products) > 0) {
    $jsonOutput = json_encode($products, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    @file_put_contents($cacheFile, $jsonOutput);
    $etag = '"' . md5($jsonOutput) . '"';
    header("ETag: $etag");
    echo $jsonOutput;
    exit(0);
}

// 4. Stale-While-Revalidate Fallback
if (file_exists($cacheFile)) {
    $staleData = @file_get_contents($cacheFile);
    if ($staleData && strlen($staleData) > 10) {
        @touch($cacheFile, time() - ($cacheTime - 60));
        $etag = '"' . md5($staleData) . '"';
        header("ETag: $etag");
        echo $staleData;
        exit(0);
    }
}

// 5. Fallback Error
http_response_code(503);
echo json_encode(["error" => "Products temporarily unavailable"], JSON_UNESCAPED_UNICODE);
