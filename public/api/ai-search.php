<?php
// ================================================================
// i SHOP BD - AI Natural Search Server-side Proxy
// Protects Gemini API Key from browser client exposure
// ================================================================

header("Content-Type: application/json; charset=UTF-8");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");

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
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "matchingIds" => []]);
    exit;
}

// Rate Limiting: 30 calls per IP per minute
session_start();
$clientIP = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$clientIP = trim(explode(',', $clientIP)[0]);
$rateLimitKey = 'ai_search_' . md5($clientIP);
$now = time();
if (!isset($_SESSION[$rateLimitKey])) {
    $_SESSION[$rateLimitKey] = ['count' => 0, 'start' => $now];
}
$rateData = &$_SESSION[$rateLimitKey];
if ($now - $rateData['start'] > 60) {
    $rateData = ['count' => 0, 'start' => $now];
}
$rateData['count']++;
if ($rateData['count'] > 30) {
    http_response_code(429);
    echo json_encode(["success" => false, "matchingIds" => [], "message" => "Too many requests"]);
    exit;
}

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

$geminiKey = getEnvVar('GEMINI_API_KEY');
if (empty($geminiKey)) {
    echo json_encode(["success" => false, "matchingIds" => []]);
    exit;
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);
$query = trim($data['query'] ?? '');
$products = $data['products'] ?? [];

if (empty($query) || !is_array($products) || count($products) === 0) {
    echo json_encode(["success" => true, "matchingIds" => []]);
    exit;
}

$prompt = "Based on these e-commerce products:\n" . json_encode(array_slice($products, 0, 100)) . "\n\nFilter and return the products matching this customer query: \"" . substr($query, 0, 200) . "\".\nReturn ONLY a valid JSON array of matching product IDs, e.g. [\"prod-1\", \"prod-2\"]. Return an empty array [] if no items match. Do not write explanations or markdown coding fence.";

$payload = [
    "contents" => [
        [
            "role" => "user",
            "parts" => [["text" => $prompt]]
        ]
    ]
];

$modelsToTry = [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite"
];

foreach ($modelsToTry as $model) {
    $url = "https://generativelanguage.googleapis.com/v1beta/models/" . $model . ":generateContent?key=" . urlencode($geminiKey);
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 4);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $resData = json_decode($response, true);
        $text = $resData['candidates'][0]['content']['parts'][0]['text'] ?? '[]';
        $cleaned = trim(preg_replace('/```json|```/', '', $text));
        $ids = json_decode($cleaned, true);
        if (is_array($ids)) {
            echo json_encode(["success" => true, "matchingIds" => $ids]);
            exit;
        }
    }
}

echo json_encode(["success" => false, "matchingIds" => []]);
?>
