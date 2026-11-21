<?php
/**
 * i SHOP BD - Admin Real-Time Traffic & Analytics Stats API (PHP Parity)
 * Supplies real-time active shopper counts, 60-min & 48-hr live velocity, and traffic source breakdowns.
 */

require_once __DIR__ . '/_marketing_lib.php';

marketingSetCorsHeaders('GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-cache, no-store, must-revalidate');

$nowMs = round(microtime(true) * 1000);

// 1. Read Recent Visits Buffer
$bufferFile = __DIR__ . '/traffic_visits_buffer.json';
$visits = [];
if (file_exists($bufferFile)) {
    $raw = @file_get_contents($bufferFile);
    if ($raw) {
        $dec = json_decode($raw, true);
        if (is_array($dec)) $visits = $dec;
    }
}

// Active Shoppers Window: Last 5 Minutes
$activeWindowMs = 5 * 60 * 1000;
$activeCutoff = $nowMs - $activeWindowMs;

// Real-Time Windows: 60 Minutes & 48 Hours
$window60mCutoff = $nowMs - (60 * 60 * 1000);
$window48hCutoff = $nowMs - (48 * 3600 * 1000);

$activeVisitorsMap = [];
$visits60m = [];
$visits48h = [];

$sourceBreakdown = [
    'facebook' => 0,
    'tiktok' => 0,
    'youtube' => 0,
    'google' => 0,
    'direct' => 0,
    'other' => 0
];

foreach ($visits as $v) {
    $ts = isset($v['timestamp']) ? (int)$v['timestamp'] : 0;
    if ($ts >= $activeCutoff) {
        $ident = !empty($v['ipMasked']) ? $v['ipMasked'] : ($v['id'] ?? 'unknown');
        $activeVisitorsMap[$ident] = true;
    }
    if ($ts >= $window60mCutoff) {
        $visits60m[] = $v;
    }
    if ($ts >= $window48hCutoff) {
        $visits48h[] = $v;
        $src = $v['source'] ?? 'direct';
        if (isset($sourceBreakdown[$src])) {
            $sourceBreakdown[$src]++;
        } else {
            $sourceBreakdown['other']++;
        }
    }
}

// 2. Read Daily Aggregates
$dailyFile = __DIR__ . '/traffic_daily_cache.json';
$dailyData = [];
if (file_exists($dailyFile)) {
    $rawDaily = @file_get_contents($dailyFile);
    if ($rawDaily) {
        $dec = json_decode($rawDaily, true);
        if (is_array($dec)) $dailyData = $dec;
    }
}

// Sort daily list descending
krsort($dailyData);
$dailyList = array_values($dailyData);

// Active Shoppers Count (Distinct visitors in last 5 minutes)
$activeShoppersCount = max(1, count($activeVisitorsMap));

// 48h volume: sum today + yesterday from daily aggregate if available
$daily48hTotal = 0;
if (count($dailyList) > 0) {
    $daily48hTotal += (int)($dailyList[0]['totalVisits'] ?? $dailyList[0]['visits'] ?? 0);
}
if (count($dailyList) > 1) {
    $daily48hTotal += (int)($dailyList[1]['totalVisits'] ?? $dailyList[1]['visits'] ?? 0);
}
$final48hCount = max($daily48hTotal, count($visits48h));

echo json_encode([
    'success' => true,
    'daily' => $dailyList,
    'recent' => array_slice($visits, 0, 50),
    'activeVisitors' => $activeShoppersCount,
    'realtime' => [
        'activeShoppers' => $activeShoppersCount,
        'last60Minutes' => count($visits60m),
        'last48Hours' => $final48hCount,
        'sources' => $sourceBreakdown
    ]
], JSON_UNESCAPED_SLASHES);
