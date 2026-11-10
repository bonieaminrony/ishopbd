<?php
/**
 * i SHOP BD - Invalidate Banner Cache Endpoint (PHP Parity)
 * Deletes stale banners_cache.json immediately when admin saves or deletes banners.
 */

require_once __DIR__ . '/_marketing_lib.php';

marketingSetCorsHeaders('GET, POST, OPTIONS');
header('Cache-Control: no-cache, no-store, must-revalidate');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

$cacheFile = __DIR__ . '/banners_cache.json';
if (file_exists($cacheFile)) {
    @unlink($cacheFile);
}

echo json_encode([
    'success' => true,
    'message' => 'Banner cache invalidated successfully',
    'timestamp' => time(),
], JSON_UNESCAPED_UNICODE);
