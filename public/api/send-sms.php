<?php
// ================================================================
// i SHOP BD - SMS API Gateway
// Security: CORS locked, Rate Limiting, Input Validation
// ================================================================

// --- CORS: Only allow your own domain ---
$allowedOrigins = [
    'https://ishopbd.online',
    'https://www.ishopbd.online',
    'http://localhost:5173',   // Local development
    'http://localhost:3000',
];
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: https://ishopbd.online");
}
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
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
$message = strip_tags(substr(trim($data['message'] ?? ''), 0, 500));  // Max 500 chars

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

// --- LOAD CREDENTIALS ---
$smsApiKey  = getEnvVar('SMS_API_KEY');
$smsSenderId = getEnvVar('SMS_SENDER_ID', '8809648908219');

if (empty($smsApiKey)) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "SMS service not configured"]);
    exit;
}

// --- FORMAT PHONE ---
if (strpos($phone, '+') === 0) {
    $phone = substr($phone, 1);
}
if (preg_match('/^01[3-9]\d{8}$/', $phone)) {
    $phone = '88' . $phone;
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
