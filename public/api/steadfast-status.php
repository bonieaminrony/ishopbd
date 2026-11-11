<?php
// ================================================================
// i SHOP BD - Steadfast Courier Status Proxy
// Security: API keys kept server-side, never exposed to browser
// ================================================================

require_once __DIR__ . '/_marketing_lib.php';

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
header("Access-Control-Allow-Headers: Content-Type");
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
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

session_start();
$clientIP = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$clientIP = trim(explode(',', $clientIP)[0]);

$rateLimitKey = 'steadfast_rate_' . md5($clientIP);
$rateWindow   = 60;
$rateMaxCalls = 30;

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
    echo json_encode(["success" => false, "message" => "Too many requests."]);
    exit;
}

$trackingId = isset($_GET['id']) ? preg_replace('/[^a-zA-Z0-9\-_]/', '', trim($_GET['id'])) : '';
if (empty($trackingId)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Tracking ID required"]);
    exit;
}

$apiKey    = trim((string)marketingGetEnvVar('STEADFAST_API_KEY'));
$secretKey = trim((string)marketingGetEnvVar('STEADFAST_SECRET_KEY'));

if ($apiKey === '' || $secretKey === '') {
    $sa = marketingGetServiceAccount();
    $projectId = $sa['project_id'] ?? (marketingGetEnvVar('FIREBASE_PROJECT_ID') ?: 'i-shop-bd');
    $dsToken = marketingGetDatastoreToken($sa);
    if ($dsToken) {
        $kCh = curl_init("https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/admin_config/keys");
        curl_setopt_array($kCh, [CURLOPT_HTTPHEADER => ["Authorization: Bearer $dsToken"], CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8]);
        $kResp = json_decode(curl_exec($kCh) ?: '', true);
        curl_close($kCh);
        if (isset($kResp['fields'])) {
            $kData = firestoreDecodeValue(['mapValue' => ['fields' => $kResp['fields']]]);
            $apiKey = $apiKey ?: trim((string)($kData['steadfastApiKey'] ?? ''));
            $secretKey = $secretKey ?: trim((string)($kData['steadfastSecretKey'] ?? ''));
        }
    }
}

if ($apiKey === '' || $secretKey === '') {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Courier service not configured"]);
    exit;
}

$candidates = [];
if (ctype_digit($trackingId)) {
    $candidates[] = "status_by_cid/" . rawurlencode($trackingId);
    $candidates[] = "status_by_invoice/" . rawurlencode($trackingId);
} else {
    $candidates[] = "status_by_trackingcode/" . rawurlencode($trackingId);
    $candidates[] = "status_by_invoice/" . rawurlencode($trackingId);
}

$lastCode = 502;
$lastResponse = null;
foreach ($candidates as $path) {
    $url = "https://portal.packzy.com/api/v1/" . $path;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Api-Key: $apiKey",
        "Secret-Key: $secretKey",
        "Content-Type: application/json",
    ]);
    $response  = curl_exec($ch);
    $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($response === false) {
        continue;
    }
    $lastCode = $httpCode ?: 502;
    $responseData = json_decode($response, true);
    $lastResponse = $responseData;
    $rawStatus = $responseData['delivery_status'] ?? ($responseData['status'] ?? null);
    if ($httpCode === 200 && is_string($rawStatus) && $rawStatus !== '') {
        echo json_encode([
            "success" => true,
            "data"    => [
                "delivery_status" => $rawStatus,
                "tracking_message" => $responseData['tracking_message'] ?? ($responseData['note'] ?? null),
            ],
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

http_response_code($lastCode);
echo json_encode([
    "success" => false,
    "message" => $lastResponse['message'] ?? "Could not retrieve tracking status",
]);
