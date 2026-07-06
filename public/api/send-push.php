<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$token = $data['token'] ?? '';
$title = $data['title'] ?? 'Notification';
$body = $data['body'] ?? '';
$link = $data['link'] ?? '/';

if (empty($token) || empty($body)) {
    http_response_code(400);
    echo json_encode(["error" => "Missing token or body"]);
    exit;
}

// Ensure service-account.json is in the same directory
$serviceAccountPath = __DIR__ . '/service-account.json';
if (!file_exists($serviceAccountPath)) {
    // try parent or just return error
    if (file_exists(__DIR__ . '/../api/service-account.json')) {
        $serviceAccountPath = __DIR__ . '/../api/service-account.json';
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Service account key not found"]);
        exit;
    }
}

// Function to get OAuth2 token using raw PHP without external libraries
function get_oauth_token($service_account_path) {
    $key_json = file_get_contents($service_account_path);
    $key_data = json_decode($key_json, true);
    
    $header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
    $now = time();
    $exp = $now + 3600;
    
    $claim = json_encode([
        'iss' => $key_data['client_email'],
        'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
        'aud' => $key_data['token_uri'],
        'exp' => $exp,
        'iat' => $now
    ]);
    
    $base64_url_header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64_url_claim = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($claim));
    
    $signature = '';
    openssl_sign($base64_url_header . '.' . $base64_url_claim, $signature, $key_data['private_key'], 'SHA256');
    $base64_url_signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    $jwt = $base64_url_header . '.' . $base64_url_claim . '.' . $base64_url_signature;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $key_data['token_uri']);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion' => $jwt
    ]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    $token_data = json_decode($response, true);
    return [
        'access_token' => $token_data['access_token'] ?? null,
        'project_id' => $key_data['project_id']
    ];
}

$auth = get_oauth_token($serviceAccountPath);
$access_token = $auth['access_token'];
$project_id = $auth['project_id'];

if (!$access_token) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to get access token"]);
    exit;
}

$fcmUrl = "https://fcm.googleapis.com/v1/projects/" . $project_id . "/messages:send";

$notification = [
    'message' => [
        'token' => $token,
        'notification' => [
            'title' => $title,
            'body' => $body
        ],
        'webpush' => [
            'fcm_options' => [
                'link' => $link
            ]
        ]
    ]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $fcmUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $access_token,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($notification));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo $result;
?>
