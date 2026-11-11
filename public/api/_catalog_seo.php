<?php
/**
 * Shared Catalog SEO Helper for /llms.txt & /api/merchant-feed.xml (not directly web-accessible).
 */
require_once __DIR__ . '/_marketing_lib.php';

function catalogSlugify($text, $maxLen = 45) {
    if (!$text) return '';
    $s = trim((string)$text);
    $s = str_replace(['&', '+', '@'], [' and ', ' plus ', ' at '], $s);
    $s = preg_replace('/(\d)\.(\d)/', '$1-$2', $s);
    $s = mb_strtolower($s, 'UTF-8');
    $s = preg_replace('/[^\w\s\x{0980}-\x{09FF}-]/u', '', $s);
    $s = preg_replace('/[\s_–—-]+/u', '-', $s);
    $s = trim($s, '-');
    if (mb_strlen($s, 'UTF-8') > $maxLen) {
        $cut = mb_substr($s, 0, $maxLen, 'UTF-8');
        $lastHyphen = mb_strrpos($cut, '-', 0, 'UTF-8');
        $s = ($lastHyphen !== false && $lastHyphen > 10) ? mb_substr($cut, 0, $lastHyphen, 'UTF-8') : $cut;
    }
    return trim($s, '-');
}

function catalogProductSlug($p) {
    if (!is_array($p)) return '';
    if (!empty($p['slug']) && is_string($p['slug']) && trim($p['slug']) !== '') {
        $custom = catalogSlugify($p['slug'], 50);
        if ($custom) return $custom;
    }
    if (!empty($p['smsName']) && is_string($p['smsName']) && mb_strlen(trim($p['smsName']), 'UTF-8') >= 3) {
        $smsSlug = catalogSlugify(trim($p['smsName']), 35);
        $prodId = !empty($p['id']) ? trim((string)$p['id']) : '';
        if ($smsSlug) {
            if ($prodId && strpos($smsSlug, strtolower($prodId)) === false) {
                $shortId = strlen($prodId) > 8 ? substr($prodId, -6) : $prodId;
                return "{$smsSlug}-{$shortId}";
            }
            return $smsSlug;
        }
    }
    $rawName = !empty($p['name']) ? $p['name'] : (!empty($p['title']) ? $p['title'] : '');
    $nameSlug = catalogSlugify($rawName, 35);
    $prodId = !empty($p['id']) ? trim((string)$p['id']) : '';
    if ($nameSlug && $prodId) {
        if (substr($nameSlug, -strlen($prodId)) === strtolower($prodId)) {
            return $nameSlug;
        }
        $shortId = strlen($prodId) > 8 ? substr($prodId, -6) : $prodId;
        return "{$nameSlug}-{$shortId}";
    }
    return $nameSlug ?: $prodId;
}

function catalogLoadPublishedProducts() {
    $cacheFile = __DIR__ . '/products_cache.json';
    $list = [];
    if (file_exists($cacheFile)) {
        $decoded = json_decode((string)@file_get_contents($cacheFile), true);
        if (is_array($decoded)) {
            $list = $decoded;
        }
    }

    if (empty($list)) {
        $sa = marketingGetServiceAccount();
        $projectId = $sa['project_id'] ?? (marketingGetEnvVar('FIREBASE_PROJECT_ID') ?: 'i-shop-bd');
        $dsToken = $sa ? marketingGetDatastoreToken($sa) : null;
        if ($dsToken) {
            $url = "https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/products?pageSize=200";
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_HTTPHEADER => ["Authorization: Bearer {$dsToken}"],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 10,
                CURLOPT_SSL_VERIFYPEER => true,
            ]);
            $resp = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            if ($code === 200 && $resp) {
                $json = json_decode($resp, true);
                foreach (($json['documents'] ?? []) as $doc) {
                    $parts = explode('/', (string)($doc['name'] ?? ''));
                    $docId = end($parts);
                    $data = firestoreDecodeValue(['mapValue' => ['fields' => $doc['fields'] ?? []]]);
                    if (is_array($data)) {
                        $data['id'] = $data['id'] ?? $docId;
                        $list[] = $data;
                    }
                }
            }
        }
    }

    return array_values(array_filter($list, function ($p) {
        return is_array($p) && empty($p['deleted']) && (!isset($p['isPublished']) || $p['isPublished'] !== false);
    }));
}

function catalogProductEffectiveStock($p) {
    if (!empty($p['variants']) && is_array($p['variants'])) {
        $sum = 0;
        foreach ($p['variants'] as $v) {
            $sum += max(0, intval($v['stock'] ?? 0));
        }
        return $sum;
    }
    return isset($p['stock']) ? max(0, intval($p['stock'])) : 10;
}

function catalogProductImageUrl($p, $baseUrl = 'https://ishopbd.com') {
    $img = trim((string)($p['image'] ?? ''));
    if ($img !== '' && strpos($img, 'data:') !== 0) {
        if (strpos($img, 'http') === 0) return $img;
        return rtrim($baseUrl, '/') . '/' . ltrim($img, '/');
    }
    $id = rawurlencode((string)($p['id'] ?? ''));
    return rtrim($baseUrl, '/') . "/api/product-image/{$id}";
}
