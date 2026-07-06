<?php
// ================================================================
// i SHOP BD - Bulk SMS API Gateway (SSE Stream)
// Security: CORS locked, Rate Limiting, Input Validation
// ================================================================

// --- CORS ---
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
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Admin-Token");

// --- ENV READER ---
if (!function_exists('getEnvVar')) {
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
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// --- ADMIN SECURITY CHECK ---
$adminToken = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? $_SERVER['X_ADMIN_TOKEN'] ?? '';
$masterPassword = getEnvVar('MASTER_ADMIN_PASSWORD');
if (empty($masterPassword) || empty($adminToken) || $adminToken !== $masterPassword) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Unauthorized: Admin access required"]);
    exit;
}

// --- RATE LIMITING: Max 2 Bulk SMS requests per IP per minute ---
session_start();
$clientIP = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$clientIP = trim(explode(',', $clientIP)[0]);

$rateLimitKey = 'bulk_sms_rate_' . md5($clientIP);
$rateWindow   = 60;   // seconds
$rateMaxCalls = 2;    // max calls per window

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
    echo json_encode(["success" => false, "message" => "অতিরিক্ত রিকোয়েস্ট করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।"]);
    exit;
}

// --- SSE HEADERS ---
// Important: Only set SSE headers if we pass validation, to avoid streaming errors.
function sendSSE($data) {
    echo "data: " . json_encode($data) . "\n\n";
    if (ob_get_level() > 0) ob_flush();
    flush();
}

$input = file_get_contents("php://input");
$data  = json_decode($input, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON"]);
    exit;
}

$phones  = $data['phones'] ?? [];
$message = strip_tags(substr(trim($data['message'] ?? ''), 0, 500));
$senderId = $data['senderId'] ?? getEnvVar('SMS_SENDER_ID', '8809648908219');
$smsApiKey = getEnvVar('SMS_API_KEY');

if (empty($smsApiKey)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "এসএমএস এপিআই কী কনফিগার করা নেই"]);
    exit;
}

if (!is_array($phones) || count($phones) === 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "কোনো ফোন নম্বর দেওয়া হয়নি"]);
    exit;
}

if (empty($message)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "মেসেজ খালি রাখা যাবে না"]);
    exit;
}

// Convert numbers (Bangla to English, remove non-digits, add 88)
$formattedPhones = [];
$banglaToEnglish = ['০'=>'0', '১'=>'1', '২'=>'2', '৩'=>'3', '৪'=>'4', '৫'=>'5', '৬'=>'6', '৭'=>'7', '৮'=>'8', '৯'=>'9'];

foreach ($phones as $phone) {
    $p = trim((string)$phone);
    $p = strtr($p, $banglaToEnglish);
    $isPlus = strpos($p, '+') === 0;
    $p = preg_replace('/[^0-9]/', '', $p);
    if ($isPlus) {
        $p = '+' . $p;
    }
    if (strpos($p, '+') === 0) {
        $p = substr($p, 1);
    }
    if (preg_match('/^01[3-9]\d{8}$/', $p)) {
        $p = '88' . $p;
    }
    if (!empty($p)) {
        $formattedPhones[] = $p;
    }
}
$formattedPhones = array_values(array_filter($formattedPhones));

// Now start SSE
header("Content-Type: text/event-stream");
header("Cache-Control: no-cache");
header("Connection: keep-alive");
header("X-Accel-Buffering: no");

$BATCH_SIZE = 500;
$totalBatches = ceil(count($formattedPhones) / $BATCH_SIZE);
$totalSuccess = 0;
$totalFail = 0;

sendSSE([
    "type" => "start",
    "total" => count($formattedPhones),
    "totalBatches" => $totalBatches
]);

for ($i = 0; $i < count($formattedPhones); $i += $BATCH_SIZE) {
    $batch = array_slice($formattedPhones, $i, $BATCH_SIZE);
    $batchNum = floor($i / $BATCH_SIZE) + 1;
    $numberStr = implode(',', $batch);
    
    sendSSE([
        "type" => "progress",
        "batchNum" => $batchNum,
        "totalBatches" => $totalBatches,
        "batchSize" => count($batch),
        "sent" => $totalSuccess,
        "failed" => $totalFail
    ]);
    
    $params = [
        'api_key'  => $smsApiKey,
        'type'     => 'text',
        'number'   => $numberStr,
        'senderid' => $senderId,
        'message'  => $message
    ];
    
    $url = 'https://bulksmsbd.net/api/smsapi?' . http_build_query($params);
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
    
    $response  = curl_exec($ch);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($response === false) {
        $totalFail += count($batch);
        sendSSE([
            "type" => "batch_done",
            "batchNum" => $batchNum,
            "success" => false,
            "count" => count($batch),
            "error" => "Network error: " . $curlError,
            "sent" => $totalSuccess,
            "failed" => $totalFail
        ]);
    } else {
        $responseData = json_decode($response, true);
        $isSuccess = false;
        
        if ($responseData) {
            if ((isset($responseData['response_code']) && $responseData['response_code'] == 202) || 
                (isset($responseData['success_message']) && empty($responseData['error_message']))) {
                $isSuccess = true;
            }
        }
        
        if ($isSuccess) {
            $totalSuccess += count($batch);
            sendSSE([
                "type" => "batch_done",
                "batchNum" => $batchNum,
                "success" => true,
                "count" => count($batch),
                "sent" => $totalSuccess,
                "failed" => $totalFail
            ]);
        } else {
            $totalFail += count($batch);
            sendSSE([
                "type" => "batch_done",
                "batchNum" => $batchNum,
                "success" => false,
                "count" => count($batch),
                "error" => $responseData['error_message'] ?? "API Error",
                "sent" => $totalSuccess,
                "failed" => $totalFail
            ]);
        }
    }
    
    if ($i + $BATCH_SIZE < count($formattedPhones)) {
        usleep(800000); // 800ms
    }
}

sendSSE([
    "type" => "done",
    "successCount" => $totalSuccess,
    "failCount" => $totalFail,
    "total" => count($formattedPhones)
]);
