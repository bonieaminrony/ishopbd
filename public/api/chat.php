<?php
// ================================================================
// i SHOP BD - AI Chat Gateway (Gemini 3.6 Flash)
// Security: CORS locked, Rate Limiting, Bengali Support
// ================================================================

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
header("Access-Control-Allow-Headers: Content-Type, Authorization");
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

// Rate limiting (max 30 requests per minute per IP)
session_start();
$clientIP = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$clientIP = trim(explode(',', $clientIP)[0]);

$rateLimitKey = 'chat_rate_' . md5($clientIP);
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
    echo json_encode(["success" => false, "error" => "Too many requests. Please wait a moment."]);
    exit;
}

// Env Reader
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

$geminiApiKey = getEnvVar('GEMINI_API_KEY');
if (empty($geminiApiKey)) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "AI configuration error (API key missing)."]);
    exit;
}

$input = file_get_contents("php://input");
$data  = json_decode($input, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid JSON payload."]);
    exit;
}

// Build contents array for Gemini API
$contents = [];

if (!empty($data['contents']) && is_array($data['contents'])) {
    $contents = $data['contents'];
} elseif (!empty($data['messages']) && is_array($data['messages'])) {
    foreach ($data['messages'] as $m) {
        $role = ($m['role'] === 'assistant' || $m['role'] === 'model') ? 'model' : 'user';
        $text = isset($m['content']) ? $m['content'] : (isset($m['parts'][0]['text']) ? $m['parts'][0]['text'] : '');
        if (!empty($text)) {
            $contents[] = [
                'role' => $role,
                'parts' => [['text' => (string)$text]]
            ];
        }
    }
}

if (empty($contents)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "No message content provided."]);
    exit;
}

// Ensure first message is user role
while (!empty($contents) && $contents[0]['role'] !== 'user') {
    array_shift($contents);
}

if (empty($contents)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "No valid user message found."]);
    exit;
}

$systemInstruction = "You are a helpful and friendly AI assistant for 'i SHOP BD' (আই শপ বিডি), the best premium online shop in Bangladesh.\n\n" .
"LANGUAGE RULE (MOST IMPORTANT): Always respond in the SAME language the user writes in.\n" .
"- If the user writes in Bengali (বাংলা), respond fully in Bengali.\n" .
"- If the user writes in English, respond in English.\n" .
"- If the user writes a mix, respond in the dominant language.\n\n" .
"Your role:\n" .
"- Help customers with product information, pricing, availability, and ordering.\n" .
"- Suggest products based on the customer's budget and interest.\n" .
"- Be warm, polite, and professional at all times.\n" .
"- Use BDT pricing format (৳).\n\n" .
"Guidelines:\n" .
"- If a product is out of stock, inform the customer politely and suggest alternatives.\n" .
"- If a customer wants to order, guide them to click 'Buy Now' or add to cart on the product page.\n" .
"- Keep responses concise and helpful.";

$payload = [
    "contents" => $contents,
    "systemInstruction" => [
        "parts" => [
            ["text" => $systemInstruction]
        ]
    ]
];

// Call Gemini 3.6 Flash API
$model = "gemini-3.6-flash";
$url = "https://generativelanguage.googleapis.com/v1beta/models/" . $model . ":generateContent?key=" . $geminiApiKey;

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false || $httpCode >= 400) {
    http_response_code($httpCode > 0 ? $httpCode : 502);
    $errRes = json_decode($response, true);
    echo json_encode([
        "success" => false,
        "error" => $errRes['error']['message'] ?? "Failed to communicate with AI.",
        "details" => $errRes ?? $response
    ]);
    exit;
}

$resData = json_decode($response, true);
$aiText = "";

if (!empty($resData['candidates'][0]['content']['parts'][0]['text'])) {
    $aiText = $resData['candidates'][0]['content']['parts'][0]['text'];
}

http_response_code(200);
echo json_encode([
    "success" => true,
    "text" => $aiText,
    "candidates" => $resData['candidates'] ?? []
]);
