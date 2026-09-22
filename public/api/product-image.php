<?php
/**
 * i SHOP BD - Ultra-Fast Product Image Proxy with Disk & HTTP Caching
 * Serves decoded Base64 and remote product images with 30-day browser caching and 3ms disk cache
 */

$rawId = isset($_GET['id']) ? trim($_GET['id']) : null;
$idx = isset($_GET['idx']) ? (int)$_GET['idx'] : null;

if (!$rawId) {
    serveFallback();
    exit;
}

$parts = explode('-', $rawId);
$lastPart = end($parts);
$candidateId = (strlen($lastPart) >= 6) ? $lastPart : $rawId;

$cacheDir = __DIR__ . '/img_cache';
if (!file_exists($cacheDir)) {
    @mkdir($cacheDir, 0755, true);
}

$idxSuffix = ($idx !== null) ? "_idx{$idx}" : "";
$cacheFilePrefix = $cacheDir . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $candidateId) . $idxSuffix;

// 1. Serve from disk cache if exists
$cachedFiles = glob($cacheFilePrefix . '.*');
if (!empty($cachedFiles)) {
    $cachedFile = $cachedFiles[0];
    $ext = pathinfo($cachedFile, PATHINFO_EXTENSION);
    $contentType = ($ext === 'png') ? 'image/png' : (($ext === 'webp') ? 'image/webp' : 'image/jpeg');

    $etag = '"' . md5_file($cachedFile) . '"';
    header("ETag: $etag");
    header("Cache-Control: public, max-age=2592000, immutable");
    if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag) {
        http_response_code(304);
        exit;
    }

    header("Content-Type: $contentType");
    header("Content-Length: " . filesize($cachedFile));
    readfile($cachedFile);
    exit;
}

// 2. Fetch from Firestore REST API
function fetchDoc($id) {
    $url = "https://firestore.googleapis.com/v1/projects/i-shop-bd/databases/(default)/documents/products/" . urlencode($id);
    $ctx = stream_context_create(array('http' => array('timeout' => 5, 'header' => "User-Agent: iShopBD-ImgProxy/2.0\r\n")));
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

if ($fields) {
    $imageStr = null;
    if ($idx !== null && isset($fields['images']['arrayValue']['values'][$idx]['stringValue'])) {
        $imageStr = trim($fields['images']['arrayValue']['values'][$idx]['stringValue']);
    } elseif (isset($fields['image']['stringValue'])) {
        $imageStr = trim($fields['image']['stringValue']);
    }

    if ($imageStr) {
        if (preg_match('/^data:image\/([a-zA-Z0-9+]+);base64,(.*)$/', $imageStr, $matches)) {
            $ext = strtolower($matches[1]);
            $ext = ($ext === 'jpg' || $ext === 'jpeg') ? 'jpg' : (($ext === 'png') ? 'png' : 'webp');
            $contentType = ($ext === 'png') ? 'image/png' : (($ext === 'webp') ? 'image/webp' : 'image/jpeg');
            $imgBuffer = base64_decode($matches[2]);

            if ($imgBuffer && strlen($imgBuffer) > 100) {
                $savedFile = $cacheFilePrefix . '.' . $ext;
                @file_put_contents($savedFile, $imgBuffer);

                $etag = '"' . md5($imgBuffer) . '"';
                header("ETag: $etag");
                header("Cache-Control: public, max-age=2592000, immutable");
                header("Content-Type: $contentType");
                header("Content-Length: " . strlen($imgBuffer));
                echo $imgBuffer;
                exit;
            }
        } elseif (strpos($imageStr, 'http://') === 0 || strpos($imageStr, 'https://') === 0) {
            header("Location: " . $imageStr, true, 301);
            exit;
        } elseif (strpos($imageStr, '/uploads/') === 0) {
            $localUploadPath = __DIR__ . '/..' . $imageStr;
            if (file_exists($localUploadPath)) {
                $ext = pathinfo($localUploadPath, PATHINFO_EXTENSION);
                $contentType = ($ext === 'png') ? 'image/png' : (($ext === 'webp') ? 'image/webp' : 'image/jpeg');
                header("Cache-Control: public, max-age=2592000, immutable");
                header("Content-Type: $contentType");
                readfile($localUploadPath);
                exit;
            }
        }
    }
}

serveFallback();

function serveFallback() {
    $ogPath = __DIR__ . '/../og-image.png';
    if (file_exists($ogPath)) {
        header("Content-Type: image/png");
        header("Cache-Control: public, max-age=86400");
        readfile($ogPath);
        exit;
    }
    $logoPath = __DIR__ . '/../logo.png';
    if (file_exists($logoPath)) {
        header("Content-Type: image/png");
        header("Cache-Control: public, max-age=86400");
        readfile($logoPath);
        exit;
    }
    http_response_code(404);
    exit;
}
