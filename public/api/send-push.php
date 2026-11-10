<?php
// ================================================================
// i SHOP BD - Web Push Notification API (Firebase Cloud Messaging v1)
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
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: https://ishopbd.com");
}
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Token, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: SAMEORIGIN");
header("X-Robots-Tag: noindex, nofollow");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function getEnvVar($key, $default = '') {
    $paths = [
        dirname(__DIR__, 2) . '/.env',
        dirname(__DIR__, 1) . '/.env',
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

function getServiceAccountData() {
    // 1. Try JSON string from .env
    $envJson = getEnvVar('FIREBASE_SERVICE_ACCOUNT_JSON');
    if (!empty($envJson)) {
        $decoded = json_decode($envJson, true);
        if ($decoded && !empty($decoded['client_email']) && !empty($decoded['private_key'])) {
            return $decoded;
        }
    }

    // 2. Try individual env vars
    $clientEmail = getEnvVar('FIREBASE_CLIENT_EMAIL');
    $privateKey = getEnvVar('FIREBASE_PRIVATE_KEY');
    $projectId = getEnvVar('FIREBASE_PROJECT_ID') ?: getEnvVar('VITE_FIREBASE_PROJECT_ID', 'i-shop-bd');
    if (!empty($clientEmail) && !empty($privateKey)) {
        return [
            'client_email' => $clientEmail,
            'private_key' => str_replace('\n', "\n", $privateKey),
            'project_id' => $projectId,
            'token_uri' => 'https://oauth2.googleapis.com/token'
        ];
    }

    // 3. Try candidate file paths strictly outside public
    $candidates = [
        getEnvVar('FIREBASE_SERVICE_ACCOUNT_PATH'),
        dirname(__DIR__, 2) . '/api/service-account.json',
        dirname(__DIR__, 2) . '/service-account.json',
        dirname(__DIR__, 1) . '/../api/service-account.json',
        $_SERVER['DOCUMENT_ROOT'] . '/../api/service-account.json',
        realpath(__DIR__ . '/../../api/service-account.json') ?: '',
        realpath(__DIR__ . '/../service-account.json') ?: '',
    ];

    foreach ($candidates as $candidate) {
        if (!empty($candidate) && file_exists($candidate)) {
            $cleanPath = str_replace('\\', '/', $candidate);
            if (strpos($cleanPath, '/public/') === false && strpos($cleanPath, '/dist/') === false) {
                $content = file_get_contents($candidate);
                $decoded = json_decode($content, true);
                if ($decoded && !empty($decoded['client_email']) && !empty($decoded['private_key'])) {
                    return $decoded;
                }
            }
        }
    }

    return null;
}

function get_oauth_token($key_data) {
    if (empty($key_data['client_email']) || empty($key_data['private_key'])) {
        return [
            'success' => false,
            'error' => 'Missing client_email or private_key in service account config'
        ];
    }

    $tokenUri = $key_data['token_uri'] ?? 'https://oauth2.googleapis.com/token';
    $headerData = ['alg' => 'RS256', 'typ' => 'JWT'];
    if (!empty($key_data['private_key_id'])) {
        $headerData['kid'] = $key_data['private_key_id'];
    }

    $now = time();
    $exp = $now + 3600;

    $claimData = [
        'iss' => $key_data['client_email'],
        'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
        'aud' => $tokenUri,
        'exp' => $exp,
        'iat' => $now
    ];

    $headerJson = json_encode($headerData);
    $claimJson = json_encode($claimData);

    $base64_url_header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($headerJson));
    $base64_url_claim = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($claimJson));
    $signingInput = $base64_url_header . '.' . $base64_url_claim;

    $privateKey = $key_data['private_key'];
    if (strpos($privateKey, '\n') !== false) {
        $privateKey = str_replace('\n', "\n", $privateKey);
    }

    $signature = '';
    $signSuccess = openssl_sign($signingInput, $signature, $privateKey, 'SHA256');
    if (!$signSuccess) {
        return [
            'success' => false,
            'error' => 'OpenSSL failed to sign JWT: ' . openssl_error_string()
        ];
    }

    $base64_url_signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    $jwt = $signingInput . '.' . $base64_url_signature;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $tokenUri);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion' => $jwt
    ]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $response = curl_exec($ch);
    $curlErr = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($curlErr) {
        return [
            'success' => false,
            'error' => 'cURL error requesting OAuth token: ' . $curlErr
        ];
    }

    $token_data = json_decode($response, true);
    if (!empty($token_data['access_token'])) {
        return [
            'success' => true,
            'access_token' => $token_data['access_token'],
            'project_id' => $key_data['project_id'] ?? 'i-shop-bd'
        ];
    }

    return [
        'success' => false,
        'http_code' => $httpCode,
        'error' => $token_data['error_description'] ?? $token_data['error'] ?? 'Unknown OAuth token response',
        'raw_response' => $response
    ];
}

// Support GET health-check for testing authentication setup
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $serviceData = getServiceAccountData();
    if (!$serviceData) {
        echo json_encode([
            "status" => "error",
            "message" => "Firebase Service Account credentials not configured or found",
            "configured" => false
        ]);
        exit;
    }

    $auth = get_oauth_token($serviceData);
    if (!$auth['success']) {
        echo json_encode([
            "status" => "warning",
            "message" => "Service account key found but OAuth failed: " . ($auth['error'] ?? 'Check key validity'),
            "configured" => true,
            "auth_success" => false,
            "details" => $auth
        ]);
        exit;
    }

    echo json_encode([
        "status" => "ok",
        "message" => "Firebase Cloud Messaging OAuth2 authentication is working properly.",
        "configured" => true,
        "auth_success" => true,
        "project_id" => $auth['project_id']
    ]);
    exit;
}

// POST endpoint for sending push notification
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

$token = $data['token'] ?? '';
$title = $data['title'] ?? 'i SHOP BD Notification';
$body = $data['body'] ?? '';
$link = $data['link'] ?? '/';
$icon = $data['icon'] ?? '/logo.png';

if (empty($token) || empty($body)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Missing required parameter: 'token' and 'body' are required."
    ]);
    exit;
}

$serviceData = getServiceAccountData();
if (!$serviceData) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Firebase Service Account credentials not found on server.",
        "solution" => "Ensure api/service-account.json exists or FIREBASE_SERVICE_ACCOUNT_JSON is set in .env"
    ]);
    exit;
}

$auth = get_oauth_token($serviceData);
if (!$auth['success']) {
    http_response_code(502);
    echo json_encode([
        "success" => false,
        "error" => "Firebase authentication failed: " . ($auth['error'] ?? 'Invalid grant or token error'),
        "details" => $auth
    ]);
    exit;
}

$access_token = $auth['access_token'];
$project_id = $auth['project_id'];

$fcmUrl = "https://fcm.googleapis.com/v1/projects/" . $project_id . "/messages:send";

$notificationPayload = [
    'message' => [
        'token' => $token,
        'notification' => [
            'title' => $title,
            'body' => $body
        ],
        'webpush' => [
            'fcm_options' => [
                'link' => $link
            ],
            'notification' => [
                'icon' => $icon,
                'badge' => '/logo.png'
            ]
        ]
    ]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $fcmUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $access_token,
    'Content-Type: application/json; charset=UTF-8'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($notificationPayload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 20);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$result = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_err = curl_error($ch);
curl_close($ch);

if ($curl_err) {
    http_response_code(502);
    echo json_encode([
        "success" => false,
        "error" => "cURL error sending to FCM: " . $curl_err
    ]);
    exit;
}

http_response_code($http_code >= 200 && $http_code < 300 ? 200 : $http_code);
if ($result) {
    echo $result;
} else {
    echo json_encode([
        "success" => ($http_code >= 200 && $http_code < 300),
        "http_code" => $http_code
    ]);
}
?>
