<?php
// ================================================================
// i SHOP BD - Admin Password Verification API
// Security: CORS locked, Rate Limiting, Server-side password check
// Master password NEVER sent to client, verified here only.
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

// --- RATE LIMITING: Max 10 attempts per IP per minute ---
session_start();
$clientIP = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$clientIP = trim(explode(',', $clientIP)[0]);

$rateLimitKey = 'admin_verify_rate_' . md5($clientIP);
$rateWindow   = 60;
$rateMaxCalls = 10;

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
    echo json_encode(["success" => false, "message" => "Too many attempts. Please wait a moment."]);
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

// --- READ INPUT ---
$input = file_get_contents("php://input");
$data  = json_decode($input, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON"]);
    exit;
}

$inputPassword = trim($data['password'] ?? '');
$isMasterEmail = (bool)($data['isMasterEmail'] ?? false);

if (empty($inputPassword)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Password is required"]);
    exit;
}

// --- MASTER PASSWORD CHECK (stored server-side only) ---
$masterPassword = getEnvVar('MASTER_ADMIN_PASSWORD');

if (empty($masterPassword)) {
    http_response_code(503);
    echo json_encode(["success" => false, "message" => "Admin login is currently disabled."]);
    exit;
}

if ($isMasterEmail && $inputPassword === $masterPassword) {
    echo json_encode(["success" => true, "type" => "master"]);
    exit;
}

// --- NORMAL ADMIN: password is checked client-side against Firestore (already hashed or plain in DB) ---
// This endpoint only handles master password verification.
// Regular admin password verification happens via Firestore directly (Firestore rules protect data).
echo json_encode(["success" => false, "message" => "Invalid master password"]);
