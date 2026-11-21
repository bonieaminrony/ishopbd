<?php
/**
 * i SHOP BD - Real-Time Traffic Visit Tracking Endpoint (PHP Parity)
 * Receives visitor hits and stores real-time streaming buffers for Admin Analytics & Active Shoppers.
 */

require_once __DIR__ . '/_marketing_lib.php';

marketingSetCorsHeaders('POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit(0);
}

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-cache, no-store, must-revalidate');

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit(0);
}

$rawIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$clientIp = trim(explode(',', $rawIp)[0]);

$ipMasked = 'masked';
if (strpos($clientIp, '.') !== false) {
    $parts = explode('.', $clientIp);
    $ipMasked = (isset($parts[0], $parts[1]) ? $parts[0] . '.' . $parts[1] : '127.0') . '.*.*';
} elseif (strpos($clientIp, ':') !== false) {
    $parts = explode(':', $clientIp);
    $ipMasked = (isset($parts[0], $parts[1]) ? $parts[0] . ':' . $parts[1] : 'fe80') . ':*';
}

$source = strtolower(trim($input['source'] ?? 'direct'));
$validSources = ['youtube', 'tiktok', 'facebook', 'google', 'direct'];
$cleanSource = in_array($source, $validSources, true) ? $source : 'other';

$path = substr((string)($input['path'] ?? '/'), 0, 100);
$device = ($input['device'] ?? '') === 'mobile' ? 'mobile' : 'desktop';
$inApp = !empty($input['inAppBrowser']) ? substr((string)$input['inAppBrowser'], 0, 30) : null;
$isUnique = !empty($input['isUnique']);
$referrer = substr((string)($input['referrer'] ?? ''), 0, 150);

$nowMs = round(microtime(true) * 1000);

$visitEntry = [
    'id' => bin2hex(random_bytes(4)),
    'timestamp' => $nowMs,
    'source' => $cleanSource,
    'path' => $path,
    'device' => $device,
    'inAppBrowser' => $inApp,
    'ipMasked' => $ipMasked,
    'referrer' => $referrer
];

// 1. Maintain Rolling Recent Visits Buffer (Traffic Activity Stream)
$bufferFile = __DIR__ . '/traffic_visits_buffer.json';
$visits = [];
if (file_exists($bufferFile)) {
    $raw = @file_get_contents($bufferFile);
    if ($raw) {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) $visits = $decoded;
    }
}

array_unshift($visits, $visitEntry);

// Retain last 48 hours or at most 500 visits
$cutoffMs = $nowMs - (48 * 3600 * 1000);
$filteredVisits = [];
foreach ($visits as $v) {
    if (isset($v['timestamp']) && $v['timestamp'] >= $cutoffMs) {
        $filteredVisits[] = $v;
        if (count($filteredVisits) >= 500) break;
    }
}

@file_put_contents($bufferFile, json_encode($filteredVisits, JSON_UNESCAPED_SLASHES), LOCK_EX);

// 2. Maintain Daily Aggregates (Asia/Dhaka time)
date_default_timezone_set('Asia/Dhaka');
$dhakaDate = date('Y-m-d');
$dhakaHour = (int)date('G'); // 0-23
$dhakaDayOfWeek = date('D');

$dailyFile = __DIR__ . '/traffic_daily_cache.json';
$dailyData = [];
if (file_exists($dailyFile)) {
    $rawDaily = @file_get_contents($dailyFile);
    if ($rawDaily) {
        $dec = json_decode($rawDaily, true);
        if (is_array($dec)) $dailyData = $dec;
    }
}

if (!isset($dailyData[$dhakaDate])) {
    $dailyData[$dhakaDate] = [
        'date' => $dhakaDate,
        'dayOfWeek' => $dhakaDayOfWeek,
        'totalVisits' => 0,
        'uniqueVisitors' => 0,
        'sources' => [
            'direct' => 0,
            'facebook' => 0,
            'youtube' => 0,
            'tiktok' => 0,
            'google' => 0,
            'other' => 0
        ],
        'hourly' => array_fill(0, 24, 0),
        'devices' => [
            'mobile' => 0,
            'desktop' => 0
        ],
        'updatedAt' => date('c')
    ];
}

$dailyData[$dhakaDate]['totalVisits']++;
if (!isset($dailyData[$dhakaDate]['sources'][$cleanSource])) {
    $dailyData[$dhakaDate]['sources'][$cleanSource] = 0;
}
$dailyData[$dhakaDate]['sources'][$cleanSource]++;

if (!isset($dailyData[$dhakaDate]['hourly'][$dhakaHour])) {
    $dailyData[$dhakaDate]['hourly'][$dhakaHour] = 0;
}
$dailyData[$dhakaDate]['hourly'][$dhakaHour]++;

if (!isset($dailyData[$dhakaDate]['devices'][$device])) {
    $dailyData[$dhakaDate]['devices'][$device] = 0;
}
$dailyData[$dhakaDate]['devices'][$device]++;

if ($isUnique) {
    $dailyData[$dhakaDate]['uniqueVisitors']++;
}
$dailyData[$dhakaDate]['updatedAt'] = date('c');

// Prune daily cache older than 60 days
if (count($dailyData) > 60) {
    krsort($dailyData);
    $dailyData = array_slice($dailyData, 0, 60, true);
}

@file_put_contents($dailyFile, json_encode($dailyData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);

echo json_encode(['success' => true]);
