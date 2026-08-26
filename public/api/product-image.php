<?php
/**
 * i SHOP BD - Product Image Proxy for Social Previews & Sharing
 */

header("Cache-Control: public, max-age=86400");

$rawId = isset($_GET['id']) ? trim($_GET['id']) : null;

if (!$rawId) {
    serveFallback();
    exit;
}

$parts = explode('-', $rawId);
$lastPart = end($parts);
$candidateId = (strlen($lastPart) >= 6) ? $lastPart : $rawId;

function fetchDoc($id) {
    $url = "https://firestore.googleapis.com/v1/projects/rokomariponnohari-c6017/databases/(default)/documents/products/" . urlencode($id);
    $ctx = stream_context_create(array('http' => array('timeout' => 3)));
    $res = @file_get_contents($url, false, $ctx);
    if ($res) {
        $json = json_decode($res, true);
        return $json['fields'] ?? null;
    }
    return null;
}

$fields = fetchDoc($candidateId);
if (!$fields && $candidateId !== $rawId) {
    $fields = fetchDoc($rawId);
}

if ($fields && isset($fields['image']['stringValue'])) {
    $imageStr = trim($fields['image']['stringValue']);

    if (preg_match('/^data:image\/([a-zA-Z0-9+]+);base64,(.*)$/', $imageStr, $matches)) {
        $ext = strtolower($matches[1]);
        $contentType = ($ext === 'jpg' || $ext === 'jpeg') ? 'image/jpeg' : (($ext === 'png') ? 'image/png' : 'image/webp');
        $imgBuffer = base64_decode($matches[2]);

        header("Content-Type: " . $contentType);
        echo $imgBuffer;
        exit;
    } elseif (strpos($imageStr, 'http://') === 0 || strpos($imageStr, 'https://') === 0) {
        header("Location: " . $imageStr, true, 301);
        exit;
    }
}

serveFallback();

function serveFallback() {
    $ogPath = __DIR__ . '/../og-image.png';
    if (file_exists($ogPath)) {
        header("Content-Type: image/png");
        readfile($ogPath);
        exit;
    }
    $logoPath = __DIR__ . '/../logo.png';
    if (file_exists($logoPath)) {
        header("Content-Type: image/png");
        readfile($logoPath);
        exit;
    }
    header("HTTP/1.0 404 Not Found");
    exit;
}
