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
// This endpoint is public (admin pages call it without a token). A per-IP limit stops anyone from
// hammering it and forcing a full Firestore re-read on every request (Firestore bill).
$invIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$invFile = sys_get_temp_dir() . '/ishopbd_invalidate_' . md5($invIp) . '.json';
$invData = json_decode((string)@file_get_contents($invFile), true);
if (!is_array($invData) || (time() - ($invData['start'] ?? 0)) > 60) $invData = ['start' => time(), 'count' => 0];
$invData['count']++;
@file_put_contents($invFile, json_encode($invData), LOCK_EX);
if ($invData['count'] > 30) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Too many requests'], JSON_UNESCAPED_UNICODE);
    exit;
}
if (file_exists($cacheFile)) {
    @unlink($cacheFile);
}

echo json_encode([
    'success' => true,
    'message' => 'Banner cache invalidated successfully',
    'timestamp' => time(),
], JSON_UNESCAPED_UNICODE);
