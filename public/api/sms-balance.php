<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");
header("X-Content-Type-Options: nosniff");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

require_once __DIR__ . '/_marketing_lib.php';

function getSmsApiKey() {
    $paramKey = trim($_GET['apiKey'] ?? '');
    if (!empty($paramKey)) return $paramKey;
    
    // Check Firestore admin_config/keys
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
            if (!empty($kData['smsApiKey'])) return trim((string)$kData['smsApiKey']);
        }
    }
    
    // Env fallback
    $envKey = trim(marketingGetEnvVar('SMS_API_KEY'));
    if (!empty($envKey)) return $envKey;

    // Default hardcoded working key
    return 'ZmxsvZfckGDXn7Pa2Tjj';
}

$apiKey = getSmsApiKey();
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
