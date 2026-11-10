<?php
/**
 * i SHOP BD - Fresh Dynamic Banners API (PHP Parity)
 * Prevents stale hero banners on direct links / first-time visits.
 */

require_once __DIR__ . '/_marketing_lib.php';

marketingSetCorsHeaders('GET, OPTIONS');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

$cacheFile = __DIR__ . '/banners_cache.json';
$cacheTime = 300; // 5 minutes max disk cache, immediately invalidated on admin banner save/delete

function bannerParseFirestoreValue($value) {
    if (!is_array($value)) return $value;
    if (isset($value['stringValue'])) return $value['stringValue'];
    if (isset($value['integerValue'])) return (int)$value['integerValue'];
    if (isset($value['doubleValue'])) return (float)$value['doubleValue'];
    if (isset($value['booleanValue'])) return (bool)$value['booleanValue'];
    if (isset($value['timestampValue'])) return $value['timestampValue'];
    if (isset($value['nullValue'])) return null;
    if (isset($value['arrayValue'])) {
        $arr = [];
        if (isset($value['arrayValue']['values']) && is_array($value['arrayValue']['values'])) {
            foreach ($value['arrayValue']['values'] as $item) {
                $arr[] = bannerParseFirestoreValue($item);
            }
        }
        return $arr;
    }
    if (isset($value['mapValue'])) {
        $map = [];
        if (isset($value['mapValue']['fields']) && is_array($value['mapValue']['fields'])) {
            foreach ($value['mapValue']['fields'] as $k => $v) {
                $map[$k] = bannerParseFirestoreValue($v);
            }
        }
        return $map;
    }
    return null;
}

function bannerParseDoc($doc) {
    $pathParts = explode('/', $doc['name'] ?? '');
    $id = end($pathParts);
    $fields = $doc['fields'] ?? [];
    $banner = ['id' => $id];
    foreach ($fields as $key => $val) {
        $banner[$key] = bannerParseFirestoreValue($val);
    }
    return $banner;
}

function bannerSortList($list) {
    usort($list, function ($a, $b) {
        return intval($a['order'] ?? 0) <=> intval($b['order'] ?? 0);
    });
    return $list;
}

// 1. Return fresh disk cache if valid
if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
    $cached = @file_get_contents($cacheFile);
    if ($cached && strlen($cached) > 10) {
        $etag = '"' . md5($cached) . '"';
        header("ETag: $etag");
        if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag) {
            http_response_code(304);
            exit(0);
        }
        echo $cached;
        exit(0);
    }
}

// 2. Fetch live banners from Firestore REST API
$apiKey = marketingGetEnvVar('VITE_FIREBASE_API_KEY') ?: 'AIzaSyClPZu-7eztcpTyOT0vVWX-znIwouTg7I8';
$projectId = marketingGetEnvVar('FIREBASE_PROJECT_ID') ?: 'i-shop-bd';
$rawDocs = [];

if (function_exists('curl_init')) {
    $runQueryUrl = "https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents:runQuery?key=" . urlencode($apiKey);
    $ch = curl_init($runQueryUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode(['structuredQuery' => ['from' => [['collectionId' => 'banners']]]]),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Referer: https://ishopbd.com/'],
        CURLOPT_TIMEOUT => 8,
        CURLOPT_CONNECTTIMEOUT => 4,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($code === 200 && $resp) {
        $items = json_decode($resp, true);
        if (is_array($items)) {
            foreach ($items as $item) {
                if (isset($item['document']) && is_array($item['document'])) {
                    $rawDocs[] = $item['document'];
                }
            }
        }
    }

    if (empty($rawDocs)) {
        $listUrl = "https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/banners?key=" . urlencode($apiKey) . "&pageSize=100";
        $ch2 = curl_init($listUrl);
        curl_setopt_array($ch2, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Referer: https://ishopbd.com/'],
            CURLOPT_TIMEOUT => 8,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $resp2 = curl_exec($ch2);
        $code2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
        curl_close($ch2);
        if ($code2 === 200 && $resp2) {
            $decoded = json_decode($resp2, true);
            if (!empty($decoded['documents']) && is_array($decoded['documents'])) {
                $rawDocs = $decoded['documents'];
            }
        }
    }
}

$banners = [];
foreach ($rawDocs as $doc) {
    $banners[] = bannerParseDoc($doc);
}
$banners = bannerSortList($banners);

if (count($banners) > 0) {
    $jsonOut = json_encode($banners, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    @file_put_contents($cacheFile, $jsonOut);
    $etag = '"' . md5($jsonOut) . '"';
    header("ETag: $etag");
    echo $jsonOut;
    exit(0);
}

// 3. Stale fallback if Firestore unreachable temporarily
if (file_exists($cacheFile)) {
    $stale = @file_get_contents($cacheFile);
    if ($stale && strlen($stale) > 10) {
        $etag = '"' . md5($stale) . '"';
        header("ETag: $etag");
        echo $stale;
        exit(0);
    }
}

echo '[]';
