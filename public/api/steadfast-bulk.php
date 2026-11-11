<?php
require_once __DIR__ . '/_marketing_lib.php';

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
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Token");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

ini_set('display_errors', 0);
error_reporting(E_ALL);

if (!marketingVerifyIsAdmin()) {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Unauthorized: Admin access required"]);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!isset($data['orders']) || !is_array($data['orders']) || count($data['orders']) === 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No orders provided']);
    exit;
}

$apiKey = trim((string)(marketingGetEnvVar('STEADFAST_API_KEY') ?: ($data['apiKey'] ?? '')));
$secretKey = trim((string)(marketingGetEnvVar('STEADFAST_SECRET_KEY') ?: ($data['secretKey'] ?? '')));

if ($apiKey === '' || $secretKey === '') {
    $sa = marketingGetServiceAccount();
    $projectId = $sa['project_id'] ?? (marketingGetEnvVar('FIREBASE_PROJECT_ID') ?: 'i-shop-bd');
    $dsToken = marketingGetDatastoreToken($sa);
    if ($dsToken) {
        $kCh = curl_init("https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/admin_config/keys");
        curl_setopt_array($kCh, [CURLOPT_HTTPHEADER => ["Authorization: Bearer $dsToken"], CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8]);
        $kResp = json_decode(curl_exec($kCh) ?: '', true);
        curl_close($kCh);
        if (isset($kResp['fields'])) {
            $kData = firestoreDecodeValue(['mapValue' => ['fields' => $kResp['fields']]]);
            $apiKey = $apiKey ?: trim((string)($kData['steadfastApiKey'] ?? ''));
            $secretKey = $secretKey ?: trim((string)($kData['steadfastSecretKey'] ?? ''));
        }
    }
}

if ($apiKey === '' || $secretKey === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Steadfast API Key or Secret Key missing']);
    exit;
}

function steadfastNormalizePhone($rawPhone) {
    $bn = ['০'=>'0','১'=>'1','২'=>'2','৩'=>'3','৪'=>'4','৫'=>'5','৬'=>'6','৭'=>'7','৮'=>'8','৯'=>'9'];
    $digits = preg_replace('/\D/', '', strtr(trim((string)$rawPhone), $bn));
    if (preg_match('/^8801\d{9}$/', $digits)) $digits = substr($digits, 2);
    elseif (preg_match('/^1\d{9}$/', $digits)) $digits = '0' . $digits;
    return $digits;
}

$orders = $data['orders'];
$processedOrders = [];

foreach ($orders as $order) {
    $payload = [
        'invoice' => isset($order['invoice']) ? $order['invoice'] : '',
        'recipient_name' => isset($order['recipient_name']) ? $order['recipient_name'] : '',
        'recipient_phone' => steadfastNormalizePhone($order['recipient_phone'] ?? ''),
        'recipient_address' => isset($order['recipient_address']) ? $order['recipient_address'] : '',
        'cod_amount' => isset($order['cod_amount']) ? floatval($order['cod_amount']) : 0,
        'note' => isset($order['note']) ? $order['note'] : 'Sent from i SHOP BD'
    ];

    $ch = curl_init('https://portal.packzy.com/api/v1/create_order');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Api-Key: ' . $apiKey,
        'Secret-Key: ' . $secretKey,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    $resultData = $response ? json_decode($response, true) : null;

    if ($httpCode === 200 && isset($resultData['status']) && $resultData['status'] == 200) {
        $consignmentId = isset($resultData['consignment']['consignment_id']) ? (string)$resultData['consignment']['consignment_id'] : null;
        $trackingCode = isset($resultData['consignment']['tracking_code']) ? (string)$resultData['consignment']['tracking_code'] : ($consignmentId ?: 'Success');
        $processedOrders[] = [
            'id' => isset($order['id']) ? $order['id'] : '',
            'success' => true,
            'consignmentId' => $consignmentId,
            'trackingId' => $trackingCode,
        ];
    } else {
        $errorMessage = 'Failed to create order';
        if (isset($resultData['message'])) {
            $errorMessage = $resultData['message'];
        } else if ($resultData) {
            $errorMessage = json_encode($resultData);
        } else if ($curlError) {
            $errorMessage = 'Network Error: ' . $curlError;
        }
        $processedOrders[] = [
            'id' => isset($order['id']) ? $order['id'] : '',
            'success' => false,
            'error' => $errorMessage
        ];
    }
}

echo json_encode([
    'success' => true,
    'processedOrders' => $processedOrders
]);
