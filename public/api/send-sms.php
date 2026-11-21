<?php
// ================================================================
// i SHOP BD - SMS API Gateway
// Security: CORS locked, Rate Limiting, Input Validation
// ================================================================

// --- CORS: Only allow your own domain ---
$allowedOrigins = [
    'https://ishopbd.com',
    'https://www.ishopbd.com',
    'https://ishopbd.online',
    'https://www.ishopbd.online',
    'http://localhost:5173',   // Local development
    'http://localhost:3000',
];
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: https://ishopbd.com");
}
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

require_once __DIR__ . '/_marketing_lib.php';

// --- BALANCE CHECK ACTION ---
if ($_SERVER['REQUEST_METHOD'] === 'GET' && (isset($_GET['action']) || isset($_GET['apiKey']) || isset($_GET['balance']))) {
    $apiKey = trim($_GET['apiKey'] ?? '');
    if (empty($apiKey)) {
        $sa = marketingGetServiceAccount();
        $projectId = $sa['project_id'] ?? (marketingGetEnvVar('FIREBASE_PROJECT_ID') ?: 'i-shop-bd');
        $dsToken = marketingGetDatastoreToken($sa);
        if ($dsToken) {
            $kCh = curl_init("https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/admin_config/keys");
            curl_setopt_array($kCh, [
                CURLOPT_HTTPHEADER => ["Authorization: Bearer $dsToken"],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 8
            ]);
            $kResp = json_decode(curl_exec($kCh) ?: '', true);
            curl_close($kCh);
            if (isset($kResp['fields'])) {
                $kData = firestoreDecodeValue(['mapValue' => ['fields' => $kResp['fields']]]);
                if (!empty($kData['smsApiKey'])) $apiKey = trim((string)$kData['smsApiKey']);
            }
        }
    }
    if (empty($apiKey)) {
        $apiKey = trim((string)marketingGetEnvVar('SMS_API_KEY')) ?: getEnvVar('SMS_API_KEY');
    }
    if (empty($apiKey)) {
        $apiKey = 'ZmxsvZfckGDXn7Pa2Tjj';
    }

    $ch = curl_init("https://bulksmsbd.net/api/getBalanceApi?api_key=" . urlencode($apiKey));
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true
    ]);
    $resp = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($resp ?: '', true);
    if (isset($data['response_code']) && $data['response_code'] == 202 && isset($data['balance'])) {
        echo json_encode(["success" => true, "balance" => $data['balance']]);
    } else {
        echo json_encode(["success" => false, "message" => $data['error_message'] ?? "ব্যালেন্স চেক করা যায়নি"]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// --- RATE LIMITING: Max 10 SMS per IP per minute ---
session_start();
$clientIP = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$clientIP = trim(explode(',', $clientIP)[0]); // Take first IP if proxy list

$rateLimitKey = 'sms_rate_' . md5($clientIP);
$rateWindow   = 60;   // seconds
$rateMaxCalls = 10;   // max calls per window

$now = time();
if (!isset($_SESSION[$rateLimitKey])) {
    $_SESSION[$rateLimitKey] = ['count' => 0, 'start' => $now];
}
$rateData = &$_SESSION[$rateLimitKey];
if ($now - $rateData['start'] > $rateWindow) {
    // Reset window
    $rateData = ['count' => 0, 'start' => $now];
}
$rateData['count']++;
if ($rateData['count'] > $rateMaxCalls) {
    http_response_code(429);
    echo json_encode(["success" => false, "message" => "Too many requests. Please try again later."]);
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

// --- READ & VALIDATE INPUT ---
$input = file_get_contents("php://input");
$data  = json_decode($input, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON"]);
    exit;
}

// Sanitize inputs
$phone   = preg_replace('/[^0-9+]/', '', trim($data['phone'] ?? ''));
$message = strip_tags(substr(trim($data['message'] ?? ''), 0, 800));  // Max 800 chars

if (empty($phone) || empty($message)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing phone or message"]);
    exit;
}

// Validate phone: must be Bangladeshi number
if (!preg_match('/^(\+?88)?01[3-9]\d{8}$/', $phone)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid phone number format"]);
    exit;
}

require_once __DIR__ . '/_marketing_lib.php';

// --- LOAD CREDENTIALS (Input -> Firestore admin_config/keys -> Env -> Fallback) ---
$smsApiKey   = trim((string)($data['apiKey'] ?? ''));
$smsSenderId = trim((string)($data['senderId'] ?? ''));

if (empty($smsApiKey) || empty($smsSenderId)) {
    $sa = marketingGetServiceAccount();
    $projectId = $sa['project_id'] ?? (marketingGetEnvVar('FIREBASE_PROJECT_ID') ?: 'i-shop-bd');
    $dsToken = marketingGetDatastoreToken($sa);
    if ($dsToken) {
        $kCh = curl_init("https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/admin_config/keys");
        curl_setopt_array($kCh, [
            CURLOPT_HTTPHEADER => ["Authorization: Bearer $dsToken"],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 8
        ]);
        $kResp = json_decode(curl_exec($kCh) ?: '', true);
        curl_close($kCh);
        if (isset($kResp['fields'])) {
            $kData = firestoreDecodeValue(['mapValue' => ['fields' => $kResp['fields']]]);
            if (empty($smsApiKey) && !empty($kData['smsApiKey'])) {
                $smsApiKey = trim((string)$kData['smsApiKey']);
            }
            if (empty($smsSenderId) && !empty($kData['smsSenderId'])) {
                $smsSenderId = trim((string)$kData['smsSenderId']);
            }
        }
    }
}

if (empty($smsApiKey)) {
    $smsApiKey = trim((string)marketingGetEnvVar('SMS_API_KEY')) ?: getEnvVar('SMS_API_KEY');
}
if (empty($smsSenderId)) {
    $smsSenderId = trim((string)marketingGetEnvVar('SMS_SENDER_ID')) ?: getEnvVar('SMS_SENDER_ID');
}

// Fallback to active verified credentials
if (empty($smsApiKey)) {
    $smsApiKey = 'ZmxsvZfckGDXn7Pa2Tjj';
}
if (empty($smsSenderId)) {
    $smsSenderId = '8809648908219';
}

// --- FORMAT PHONE ---
if (strpos($phone, '+') === 0) {
    $phone = substr($phone, 1);
}
if (preg_match('/^01[3-9]\d{8}$/', $phone)) {
    $phone = '88' . $phone;
}

require_once __DIR__ . '/_marketing_lib.php';
$isSmsAdmin = marketingVerifyIsAdmin();
if (!$isSmsAdmin) {
    $phoneLimitFile = sys_get_temp_dir() . '/ishopbd_sms_phone_' . md5($phone) . '.json';
    $phoneTimestamps = [];
    if (file_exists($phoneLimitFile)) {
        $decoded = json_decode(@file_get_contents($phoneLimitFile), true);
        if (is_array($decoded)) {
            $phoneTimestamps = array_values(array_filter($decoded, function($ts) use ($now) { return is_int($ts) && ($now - $ts) < 300; }));
        }
    }
    if (count($phoneTimestamps) >= 3) {
        http_response_code(429);
        echo json_encode(["success" => false, "message" => "Too many SMS requests for this phone number. Please try again later."]);
        exit;
    }
    $phoneTimestamps[] = $now;
    @file_put_contents($phoneLimitFile, json_encode($phoneTimestamps), LOCK_EX);
}

// --- SEND SMS ---
$params = [
    'api_key'  => $smsApiKey,
    'type'     => 'text',
    'number'   => $phone,
    'senderid' => $smsSenderId,
    'message'  => $message
];

$url = 'https://bulksmsbd.net/api/smsapi?' . http_build_query($params);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);   // SSL verification ON
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);   // No redirects

$response  = curl_exec($ch);
$httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    echo json_encode(["success" => false, "message" => "SMS gateway connection failed"]);
    exit;
}

$responseData = json_decode($response, true);
$isSuccess = isset($responseData['response_code']) && $responseData['response_code'] == 202;

http_response_code($isSuccess ? 200 : 502);
echo json_encode([
    "success" => $isSuccess,
    "message" => $isSuccess
        ? "SMS sent successfully"
        : ($responseData['error_message'] ?? "Failed to send SMS"),
]);
