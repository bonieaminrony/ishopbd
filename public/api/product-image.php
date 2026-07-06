<?php
$productId = isset($_GET['id']) ? $_GET['id'] : null;

if (!$productId) {
    header("HTTP/1.0 404 Not Found");
    exit;
}

$url = "https://firestore.googleapis.com/v1/projects/i-shop-bd/databases/(default)/documents/products/" . urlencode($productId);
$ctx = stream_context_create(array('http' => array('timeout' => 5)));
$response = @file_get_contents($url, false, $ctx);

if ($response) {
    $data = json_decode($response, true);
    if (isset($data['fields']['image']['stringValue'])) {
        $imageStr = $data['fields']['image']['stringValue'];
        
        if (preg_match('/^data:([^;]+);base64,(.*)$/', $imageStr, $matches)) {
            $contentType = $matches[1];
            $base64Data = $matches[2];
            $imgBuffer = base64_decode($base64Data);
            
            header("Content-Type: " . $contentType);
            header("Cache-Control: public, max-age=86400");
            echo $imgBuffer;
            exit;
        } else if (strpos($imageStr, 'http://') === 0 || strpos($imageStr, 'https://') === 0) {
            header("Location: " . $imageStr);
            exit;
        }
    }
}

// Fallback to default logo
$logoPath = __DIR__ . '/../logo.png';
if (file_exists($logoPath)) {
    header("Content-Type: image/png");
    readfile($logoPath);
    exit;
}

header("HTTP/1.0 404 Not Found");
