<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

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

$apiKey = getEnvVar('STEADFAST_API_KEY');
$secretKey = getEnvVar('STEADFAST_SECRET_KEY');

if (empty($apiKey) || empty($secretKey)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Steadfast API Key or Secret Key missing on server"]);
    exit;
}

$phone = $_GET['phone'] ?? '';
if (empty($phone)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Phone number required"]);
    exit;
}

$ch = curl_init('https://portal.packzy.com/api/v1/fraud_status/' . urlencode($phone));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Api-Key: ' . $apiKey,
    'Secret-Key: ' . $secretKey,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response && $httpCode == 200) {
    echo $response;
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "error" => "Failed to fetch fraud status from Steadfast"
    ]);
}
?>
