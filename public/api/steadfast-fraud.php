<?php
// ================================================================
// i SHOP BD - Steadfast Courier Fraud & Delivery Rate Proxy
// Security: API keys kept server-side, never exposed to browser
// ================================================================

// --- CORS: Only allow your own domain ---
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
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Token");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}

require_once __DIR__ . '/_marketing_lib.php';
if (!marketingVerifyIsAdmin()) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Unauthorized: Admin access required"]);
    exit;
}

// --- RATE LIMITING ---
session_start();
$clientIP = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$clientIP = trim(explode(',', $clientIP)[0]);

$rateLimitKey = 'steadfast_fraud_rate_' . md5($clientIP);
$rateWindow   = 60;
$rateMaxCalls = 40;

$now = time();
if (!isset($_SESSION[$rateLimitKey])) {
    $_SESSION[$rateLimitKey] = ['count' => 0, 'start' => $now];
}
$rateData = &$_SESSION[$rateLimitKey];
if ($now - $rateData['start'] > $rateWindow) {
    $rateData = ['count' => 0, 'start' => $now];
}
$rateData['count']++;
if ($rateData['count'] > $rateMaxCalls) {
    http_response_code(429);
    echo json_encode(["success" => false, "error" => "Too many requests. Please try again in a moment."]);
    exit;
}

// --- ENV READER ---
function getEnvVar($key, $default = '') {
    $paths = [
        __DIR__ . '/../../.env',
        __DIR__ . '/../.env',
        $_SERVER['DOCUMENT_ROOT'] . '/../.env',
        $_SERVER['DOCUMENT_ROOT'] . '/.env',
    ];
    foreach ($paths as $path) {
        $realPath = realpath($path);
        if ($realPath && file_exists($realPath)) {
            $lines = file($realPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line) || $line[0] === '#') continue;
                $parts = explode('=', $line, 2);
                if (count($parts) === 2 && trim($parts[0]) === $key) {
                    return trim(trim($parts[1]), "\"'");
                }
            }
        }
    }
    return $default;
}

$apiKey = getEnvVar('STEADFAST_API_KEY');
$secretKey = getEnvVar('STEADFAST_SECRET_KEY');

if (empty($apiKey) || empty($secretKey)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Steadfast API credentials missing on server."]);
    exit;
}

$rawPhone = $_GET['phone'] ?? '';
$phone = preg_replace('/[^0-9]/', '', $rawPhone);
if (strpos($phone, '8801') === 0 && strlen($phone) === 13) {
    $phone = substr($phone, 2);
} elseif (strpos($phone, '1') === 0 && strlen($phone) === 10) {
    $phone = '0' . $phone;
}
if (empty($phone) || strlen($phone) < 6) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Valid phone number required"]);
    exit;
}

$forceRefresh = isset($_GET['refresh']) && ($_GET['refresh'] === '1' || $_GET['refresh'] === 'true');
$cacheTtlSeconds = 12 * 60 * 60;
$cacheFile = rtrim(sys_get_temp_dir(), '/\\') . '/ishopbd_steadfast_fraud_' . md5($phone) . '.json';

if (!$forceRefresh && file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTtlSeconds) {
    $cachedJson = @file_get_contents($cacheFile);
    if ($cachedJson !== false) {
        $cachedData = json_decode($cachedJson, true);
        if (is_array($cachedData)) {
            $cachedData['cached'] = true;
            echo json_encode(["success" => true, "data" => $cachedData]);
            exit;
        }
    }
}

// Function to call Steadfast endpoint
function callSteadfastApi($url, $apiKey, $secretKey) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
    curl_setopt($ch, CURLOPT_TIMEOUT, 12);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Api-Key: ' . $apiKey,
        'Secret-Key: ' . $secretKey,
        'Content-Type: application/json'
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $httpCode, 'body' => $response];
}

// Primary endpoint: Steadfast score API
$primaryUrl = 'https://portal.packzy.com/api/v1/fraud_check/score/' . urlencode($phone);
$result = callSteadfastApi($primaryUrl, $apiKey, $secretKey);

// Fallback to legacy endpoint if /score/ returns 404
if ($result['code'] === 404) {
    $fallbackUrl = 'https://portal.packzy.com/api/v1/fraud_check/' . urlencode($phone);
    $result = callSteadfastApi($fallbackUrl, $apiKey, $secretKey);
}

$response = $result['body'];
$httpCode = $result['code'];

$decoded = json_decode($response, true);

if ($httpCode === 200 && is_array($decoded)) {
    $deliveryRate = isset($decoded['delivery_ratio']) && $decoded['delivery_ratio'] !== null ? floatval($decoded['delivery_ratio']) : null;
    $cancellationRate = isset($decoded['cancellation_ratio']) && $decoded['cancellation_ratio'] !== null ? floatval($decoded['cancellation_ratio']) : (isset($decoded['return_ratio']) && $decoded['return_ratio'] !== null ? floatval($decoded['return_ratio']) : null);
    
    $fraudReports = 0;
    if (isset($decoded['total_reports'])) {
        $fraudReports = intval($decoded['total_reports']);
    } elseif (isset($decoded['total_fraud_reports']) && is_array($decoded['total_fraud_reports'])) {
        $fraudReports = count($decoded['total_fraud_reports']);
    } elseif (isset($decoded['total_fraud_report'])) {
        $fraudReports = intval($decoded['total_fraud_report']);
    }

    $volumeBand = isset($decoded['volume_band']) ? strval($decoded['volume_band']) : '';
    $volumeRange = isset($decoded['volume_range']) ? strval($decoded['volume_range']) : '';
    $totalParcel = intval($decoded['total_parcels'] ?? $decoded['total_parcel'] ?? 0);
    $totalDelivered = intval($decoded['total_delivered'] ?? 0);
    $totalCancelled = intval($decoded['total_cancelled'] ?? 0);

    // If total_parcel > 0 and ratios are missing, calculate them
    if ($totalParcel > 0) {
        if ($deliveryRate === null) {
            $deliveryRate = round(($totalDelivered / $totalParcel) * 100);
        }
        if ($cancellationRate === null) {
            $cancellationRate = round(($totalCancelled / $totalParcel) * 100);
        }
    }

    $responseData = [
        "phone" => $phone,
        "delivery_rate" => $deliveryRate,
        "cancellation_rate" => $cancellationRate,
        "delivery_ratio" => $deliveryRate,
        "cancellation_ratio" => $cancellationRate,
        "return_ratio" => $cancellationRate,
        "total_fraud_report" => $fraudReports,
        "total_reports" => $fraudReports,
        "volume_band" => $volumeBand,
        "volume_range" => $volumeRange,
        "total_parcel" => $totalParcel,
        "total_delivered" => $totalDelivered,
        "total_cancelled" => $totalCancelled,
        "cached" => false,
        "fetched_at" => gmdate('c'),
        "raw" => $decoded
    ];

    @file_put_contents($cacheFile, json_encode($responseData), LOCK_EX);

    echo json_encode([
        "success" => true,
        "data" => $responseData
    ]);
} else {
    http_response_code($httpCode >= 400 ? $httpCode : 500);
    echo json_encode([
        "success" => false, 
        "error" => $decoded['message'] ?? $decoded['error'] ?? "Failed to fetch fraud status from Steadfast"
    ]);
}
?>
