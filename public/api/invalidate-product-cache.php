<?php
/**
 * i SHOP BD - Invalidate Product Cache Endpoint
 * Clears on-disk products_cache.json so next visitor triggers a fresh Firestore fetch
 */

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
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Api-Key");
header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: no-cache, no-store, must-revalidate");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

$cacheFile = __DIR__ . '/products_cache.json';
if (file_exists($cacheFile)) {
    @unlink($cacheFile);
}

echo json_encode([
    "success" => true,
    "message" => "Product cache invalidated successfully",
    "timestamp" => time()
], JSON_UNESCAPED_UNICODE);
