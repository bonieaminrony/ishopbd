<?php
/**
 * i SHOP BD - Admin Real-Time Traffic & Analytics Stats API (PHP)
 * Real counts for the admin Analytics page:
 *   - active now     = distinct people seen in the last 5 minutes (0 when nobody is on the site)
 *   - last 60 min    = distinct people in the last 60 minutes
 *   - last 24 hours  = distinct people in the last 24 hours
 *   - last 48 hours  = page views in the last 48 rolling hours (from the hourly counters)
 * Admin only: the visit stream is not public.
 */

require_once __DIR__ . '/_marketing_lib.php';

marketingSetCorsHeaders('GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-cache, no-store, must-revalidate');

if (!marketingVerifyIsAdmin(true)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit(0);
}

$nowMs = round(microtime(true) * 1000);

// 1. Recent visits buffer (last 48h, newest first)
$bufferFile = __DIR__ . '/traffic_visits_buffer.json';
$visits = [];
if (file_exists($bufferFile)) {
    $raw = @file_get_contents($bufferFile);
    if ($raw) {
        $dec = json_decode($raw, true);
        if (is_array($dec)) $visits = $dec;
    }
}

function visitorKey($v) {
    if (!empty($v['visitorId'])) return 'v:' . $v['visitorId'];
    // Older entries have no visitor id: masked IP + device is the best available guess
    return 'ip:' . ($v['ipMasked'] ?? '') . '|' . ($v['device'] ?? '') . '|' . ($v['id'] ?? '');
}

$cut5m = $nowMs - 5 * 60 * 1000;
$cut60m = $nowMs - 60 * 60 * 1000;
$cut24h = $nowMs - 24 * 3600 * 1000;
$cut48h = $nowMs - 48 * 3600 * 1000;

$active = [];
$people60m = [];
$people24h = [];
$views60m = 0;
$sources24h = ['facebook' => 0, 'tiktok' => 0, 'youtube' => 0, 'google' => 0, 'direct' => 0, 'other' => 0];
$oldestTs = $nowMs;

foreach ($visits as $v) {
    $ts = isset($v['timestamp']) ? (int)$v['timestamp'] : 0;
    if ($ts <= 0) continue;
    if ($ts < $oldestTs) $oldestTs = $ts;
    $key = visitorKey($v);
    if ($ts >= $cut5m) $active[$key] = true;
    if ($ts >= $cut60m) {
        $people60m[$key] = true;
        if (($v['kind'] ?? 'visit') === 'visit') $views60m++;
    }
    if ($ts >= $cut24h && !isset($people24h[$key])) {
        $people24h[$key] = true;
        $src = $v['source'] ?? 'direct';
        $sources24h[isset($sources24h[$src]) ? $src : 'other']++;
    }
}
// If the buffer was full, the 24h figure only covers part of the day
$bufferCovers24h = count($visits) < 5000 || $oldestTs <= $cut24h;

// 2. Daily aggregates
$dailyFile = __DIR__ . '/traffic_daily_cache.json';
$dailyData = [];
if (file_exists($dailyFile)) {
    $rawDaily = @file_get_contents($dailyFile);
    if ($rawDaily) {
        $dec = json_decode($rawDaily, true);
        if (is_array($dec)) $dailyData = $dec;
    }
}
krsort($dailyData);
$dailyList = array_values($dailyData);

// 3. Page views in the last 48 rolling hours, from the per-hour counters (Dhaka time)
date_default_timezone_set('Asia/Dhaka');
$views48h = 0;
$nowSec = time();
for ($h = 0; $h < 48; $h++) {
    $t = $nowSec - $h * 3600;
    $d = date('Y-m-d', $t);
    $hr = (int)date('G', $t);
    if (isset($dailyData[$d]['hourly'][$hr])) $views48h += (int)$dailyData[$d]['hourly'][$hr];
}

echo json_encode([
    'success' => true,
    'daily' => $dailyList,
    'recent' => array_slice($visits, 0, 50),
    'activeVisitors' => count($active),
    'realtime' => [
        'activeShoppers' => count($active),
        'last60Minutes' => count($people60m),
        'last60MinutesViews' => $views60m,
        'last24HoursVisitors' => count($people24h),
        'last24HoursComplete' => $bufferCovers24h,
        'last48Hours' => $views48h,
        'sources' => $sources24h
    ]
], JSON_UNESCAPED_SLASHES);
