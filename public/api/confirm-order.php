<?php
// ================================================================
// i SHOP BD - Order Confirmation API
// Security: CORS locked, Input Sanitization, Email Header Injection fix
// ================================================================

// --- CORS: Only allow your own domain ---
$allowedOrigins = [
    'https://ishopbd.online',
    'https://www.ishopbd.online',
    'http://localhost:5173',
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

// --- RATE LIMITING: Max 20 order confirmations per IP per minute ---
session_start();
$clientIP = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$clientIP = trim(explode(',', $clientIP)[0]);

$rateLimitKey = 'order_rate_' . md5($clientIP);
$rateWindow   = 60;
$rateMaxCalls = 20;

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

// --- SANITIZE HELPER (Email Header Injection protection) ---
function sanitizeHeaderValue($value, $maxLen = 200) {
    // Remove newlines (email header injection attack vector)
    $value = preg_replace('/[\r\n\t]/', ' ', $value);
    // Remove HTML tags
    $value = strip_tags($value);
    // Trim and limit length
    return substr(trim($value), 0, $maxLen);
}

function sanitizeText($value, $maxLen = 1000) {
    $value = strip_tags($value);
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value); // remove control chars
    return substr(trim($value), 0, $maxLen);
}

// --- READ & VALIDATE INPUT ---
$input = file_get_contents("php://input");
$data  = json_decode($input, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON"]);
    exit;
}

// Sanitize all inputs to prevent email header injection
$customerName  = sanitizeHeaderValue($data['customerName'] ?? '', 200);
$customerPhone = preg_replace('/[^0-9+\-\s]/', '', $data['customerPhone'] ?? '');
$customerPhone = substr($customerPhone, 0, 20);
$address       = sanitizeText($data['address'] ?? '', 500);
$total         = filter_var($data['total'] ?? 0, FILTER_VALIDATE_FLOAT);
$items         = is_array($data['items'] ?? null) ? $data['items'] : [];

if (empty($customerName) || empty($customerPhone) || empty($address)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing order details"]);
    exit;
}

if ($total === false || $total < 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid total amount"]);
    exit;
}

// Max 50 items allowed
$items = array_slice($items, 0, 50);

// --- BUILD EMAIL ---
$emailUser = getEnvVar('EMAIL_USER', 'ishopbd.online@gmail.com');
$to        = getEnvVar('ORDER_NOTIFY_EMAIL') ?: getEnvVar('EMAIL_USER') ?: 'ishopbd.online@gmail.com';
$subject   = "=?UTF-8?B?" . base64_encode("New Order from " . $customerName) . "?=";

$itemsList = '';
foreach ($items as $item) {
    if (!is_array($item)) continue;
    $productName = sanitizeText(($item['product']['name'] ?? 'Product'), 200);
    $qty         = max(1, intval($item['quantity'] ?? 1));
    $itemsList  .= "- " . $productName . " (Qty: " . $qty . ")\n";
}

$message =
    "=== নতুন অর্ডার (i SHOP BD) ===\n\n" .
    "Customer Name : " . $customerName . "\n" .
    "Phone Number  : " . $customerPhone . "\n" .
    "Address       : " . $address . "\n" .
    "Total Amount  : ৳" . number_format($total, 2) . "\n\n" .
    "Items:\n" . ($itemsList ?: "No items\n") .
    "\n=================================\n" .
    "Sent via i SHOP BD API\n";

$headers =
    "From: i SHOP BD <" . $emailUser . ">\r\n" .
    "Reply-To: " . $emailUser . "\r\n" .
    "Content-Type: text/plain; charset=UTF-8\r\n" .
    "MIME-Version: 1.0\r\n" .
    "X-Mailer: PHP/" . phpversion();

// --- SEND EMAIL ---
$mailSent = @mail($to, $subject, $message, $headers);

if ($mailSent) {
    echo json_encode(["success" => true, "message" => "Order confirmation sent"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to send email notification"]);
}
