<?php
// ================================================================
// i SHOP BD - Admin Password Verification API
// Security: CORS locked, Rate Limiting, Server-side password check
// Master password NEVER sent to client, verified here only.
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
header("Access-Control-Allow-Headers: Content-Type, X-Admin-Token");
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

// --- RATE LIMITING: Max 10 attempts per IP per minute, 5 wrong passwords -> 15 min lockout ---
// Stored in a server-side file keyed by the real connection IP. The old version kept the counter
// in the PHP session (a cookie) and trusted X-Forwarded-For, so an attacker could reset it on
// every request by dropping the cookie or changing the header and guess passwords without limit.
$clientIP = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = sys_get_temp_dir() . '/ishopbd_admin_verify_' . md5($clientIP) . '.json';
$rateWindow   = 60;
$rateMaxCalls = 10;
$maxFails     = 5;
$lockSeconds  = 900;

$now = time();
$rateData = ['count' => 0, 'start' => $now, 'fails' => 0, 'lockedUntil' => 0];
if (file_exists($rateFile)) {
    $saved = json_decode((string)@file_get_contents($rateFile), true);
    if (is_array($saved)) $rateData = array_merge($rateData, $saved);
}
if (($rateData['lockedUntil'] ?? 0) > $now) {
    http_response_code(429);
    echo json_encode(["success" => false, "message" => "Too many failed attempts. Try again in " . ($rateData['lockedUntil'] - $now) . " seconds."]);
    exit;
}
if ($now - $rateData['start'] > $rateWindow) {
    $rateData['count'] = 0;
    $rateData['start'] = $now;
}
$rateData['count']++;
@file_put_contents($rateFile, json_encode($rateData), LOCK_EX);
if ($rateData['count'] > $rateMaxCalls) {
    http_response_code(429);
    echo json_encode(["success" => false, "message" => "Too many attempts. Please wait a moment."]);
    exit;
}

function recordAdminVerifyResult($rateFile, $rateData, $success, $maxFails, $lockSeconds) {
    if ($success) {
        $rateData['fails'] = 0;
        $rateData['lockedUntil'] = 0;
    } else {
        $rateData['fails'] = ($rateData['fails'] ?? 0) + 1;
        if ($rateData['fails'] >= $maxFails) {
            $rateData['lockedUntil'] = time() + $lockSeconds;
            $rateData['fails'] = 0;
        }
    }
    @file_put_contents($rateFile, json_encode($rateData), LOCK_EX);
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

if ($isMasterEmail && hash_equals($masterPassword, $inputPassword)) {
    recordAdminVerifyResult($rateFile, $rateData, true, $maxFails, $lockSeconds);
    echo json_encode(["success" => true, "type" => "master"]);
    exit;
}
recordAdminVerifyResult($rateFile, $rateData, false, $maxFails, $lockSeconds);

// --- NORMAL ADMIN: password is checked client-side against Firestore (already hashed or plain in DB) ---
// This endpoint only handles master password verification.
// Regular admin password verification happens via Firestore directly (Firestore rules protect data).
echo json_encode(["success" => false, "message" => "Invalid master password"]);
