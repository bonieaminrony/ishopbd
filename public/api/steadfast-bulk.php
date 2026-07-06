<?php
header('Content-Type: application/json');

// Enable error reporting for debugging
ini_set('display_errors', 0);
error_reporting(E_ALL);

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

// --- ADMIN SECURITY CHECK ---
$adminToken = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? $_SERVER['X_ADMIN_TOKEN'] ?? '';
$masterPassword = getEnvVar('MASTER_ADMIN_PASSWORD');
if (empty($masterPassword) || empty($adminToken) || $adminToken !== $masterPassword) {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Unauthorized: Admin access required"]);
    exit;
}

// Read JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!isset($data['orders']) || !is_array($data['orders']) || count($data['orders']) === 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No orders provided']);
    exit;
}

// Use server-side keys primarily; fallback to body keys for backward compatibility
$apiKey = getEnvVar('STEADFAST_API_KEY') ?: ($data['apiKey'] ?? '');
$secretKey = getEnvVar('STEADFAST_SECRET_KEY') ?: ($data['secretKey'] ?? '');

if (empty($apiKey) || empty($secretKey)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Steadfast API Key or Secret Key missing']);
    exit;
}

$orders = $data['orders'];
$processedOrders = [];

foreach ($orders as $order) {
    $payload = [
        'invoice' => isset($order['invoice']) ? $order['invoice'] : '',
        'recipient_name' => isset($order['recipient_name']) ? $order['recipient_name'] : '',
        'recipient_phone' => isset($order['recipient_phone']) ? $order['recipient_phone'] : '',
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

    // Write log for debugging
    $logData = date('[Y-m-d H:i:s] ') . "Raw Input: " . $input . "\n"
             . "Request Payload: " . json_encode($payload) . "\n"
             . "HTTP Code: " . $httpCode . "\n"
             . "Response: " . $response . "\n"
             . "Curl Error: " . $curlError . "\n\n";
    file_put_contents(__DIR__ . '/debug_steadfast.log', $logData, FILE_APPEND);

    $resultData = null;
    if ($response) {
        $resultData = json_decode($response, true);
    }

    if ($httpCode === 200 && isset($resultData['status']) && $resultData['status'] == 200) {
        $trackingCode = isset($resultData['consignment']['tracking_code']) ? $resultData['consignment']['tracking_code'] : 
                        (isset($resultData['consignment']['consignment_id']) ? $resultData['consignment']['consignment_id'] : 'Success');
        $processedOrders[] = [
            'id' => isset($order['id']) ? $order['id'] : '',
            'success' => true,
            'trackingId' => $trackingCode
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

$output = json_encode([
    'success' => true,
    'processedOrders' => $processedOrders
]);
file_put_contents(__DIR__ . '/debug_steadfast.log', date('[Y-m-d H:i:s] ') . "Output to frontend: " . $output . "\n\n", FILE_APPEND);
echo $output;
?>
