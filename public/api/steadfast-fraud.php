<?php
// ================================================================
// i SHOP BD - Steadfast Courier Fraud & Delivery Rate Proxy (PHP Parity)
// Supports:
//   GET  /api/courier/steadfast/fraud/:phone
//   POST /api/courier/steadfast/fraud/batch
// Uses shared Firestore cache (`courier_fraud_cache`), /tmp cache,
// `admin_config/keys` credential fallback, and 429 cooldown protection.
// ================================================================

require_once __DIR__ . '/_marketing_lib.php';

marketingSetCorsHeaders('GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

$action = trim((string)($_GET['action'] ?? ''));
$isBatchRequest = ($_SERVER['REQUEST_METHOD'] === 'POST' && ($action === 'batch' || ($_GET['phone'] ?? '') === 'batch'));

if (!$isBatchRequest && $_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

if (!marketingVerifyIsAdmin(true)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized: Admin access required']);
    exit;
}

function steadfastNormalizePhone($rawPhone) {
    $digits = preg_replace('/[^0-9]/', '', (string)$rawPhone);
    if (strpos($digits, '8801') === 0 && strlen($digits) === 13) {
        return substr($digits, 2);
    }
    if (strpos($digits, '1') === 0 && strlen($digits) === 10) {
        return '0' . $digits;
    }
    return $digits;
}

function steadfastGetFirestoreContext() {
    static $ctx = null;
    if ($ctx !== null) return $ctx;
    $sa = marketingGetServiceAccount();
    $projectId = $sa['project_id'] ?? (marketingGetEnvVar('FIREBASE_PROJECT_ID') ?: 'i-shop-bd');
    $dsToken = $sa ? marketingGetDatastoreToken($sa) : null;
    $ctx = ['projectId' => $projectId, 'token' => $dsToken];
    return $ctx;
}

function steadfastResolveCredentials() {
    $apiKey = trim((string)marketingGetEnvVar('STEADFAST_API_KEY'));
    $secretKey = trim((string)marketingGetEnvVar('STEADFAST_SECRET_KEY'));
    if ($apiKey !== '' && $secretKey !== '') {
        return [$apiKey, $secretKey];
    }

    $ctx = steadfastGetFirestoreContext();
    if (!empty($ctx['token'])) {
        $url = "https://firestore.googleapis.com/v1/projects/{$ctx['projectId']}/databases/(default)/documents/admin_config/keys";
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_HTTPHEADER => ["Authorization: Bearer {$ctx['token']}"],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($code === 200 && $resp) {
            $decoded = json_decode($resp, true);
            if (!empty($decoded['fields'])) {
                $doc = firestoreDecodeValue(['mapValue' => ['fields' => $decoded['fields']]]);
                if ($apiKey === '' && !empty($doc['steadfastApiKey'])) {
                    $apiKey = trim((string)$doc['steadfastApiKey']);
                }
                if ($secretKey === '' && !empty($doc['steadfastSecretKey'])) {
                    $secretKey = trim((string)$doc['steadfastSecretKey']);
                }
            }
        }
    }

    return [$apiKey, $secretKey];
}

function steadfastGetCooldownRemaining() {
    $cooldownFile = rtrim(sys_get_temp_dir(), '/\\') . '/ishopbd_sf_fraud_cooldown.txt';
    if (!file_exists($cooldownFile)) return 0;
    $until = intval(trim((string)@file_get_contents($cooldownFile)));
    return max(0, $until - time());
}

function steadfastSetCooldown($seconds = 300) {
    $cooldownFile = rtrim(sys_get_temp_dir(), '/\\') . '/ishopbd_sf_fraud_cooldown.txt';
    @file_put_contents($cooldownFile, (string)(time() + $seconds), LOCK_EX);
}

function steadfastParsePayload($phone, $decoded, $cached = false, $fetchedAt = null) {
    if (!is_array($decoded)) return null;
    $raw = (isset($decoded['raw']) && is_array($decoded['raw'])) ? $decoded['raw'] : $decoded;

    $deliveryRate = null;
    if (isset($decoded['delivery_ratio']) && $decoded['delivery_ratio'] !== null) {
        $deliveryRate = floatval($decoded['delivery_ratio']);
    } elseif (isset($decoded['delivery_rate']) && $decoded['delivery_rate'] !== null) {
        $deliveryRate = floatval($decoded['delivery_rate']);
    }

    $cancellationRate = null;
    if (isset($decoded['cancellation_ratio']) && $decoded['cancellation_ratio'] !== null) {
        $cancellationRate = floatval($decoded['cancellation_ratio']);
    } elseif (isset($decoded['cancellation_rate']) && $decoded['cancellation_rate'] !== null) {
        $cancellationRate = floatval($decoded['cancellation_rate']);
    } elseif (isset($decoded['return_ratio']) && $decoded['return_ratio'] !== null) {
        $cancellationRate = floatval($decoded['return_ratio']);
    }

    $fraudReports = 0;
    if (isset($decoded['total_reports'])) {
        $fraudReports = intval($decoded['total_reports']);
    } elseif (isset($decoded['total_fraud_reports']) && is_array($decoded['total_fraud_reports'])) {
        $fraudReports = count($decoded['total_fraud_reports']);
    } elseif (isset($decoded['total_fraud_report'])) {
        $fraudReports = intval($decoded['total_fraud_report']);
    }

    $volumeBand = isset($decoded['volume_band']) ? strval($decoded['volume_band']) : '';
    $volumeRange = isset($decoded['volume_range']) ? strval($decoded['volume_range']) : '';
    $totalParcel = intval($decoded['total_parcels'] ?? $decoded['total_parcel'] ?? 0);
    $totalDelivered = intval($decoded['total_delivered'] ?? 0);
    $totalCancelled = intval($decoded['total_cancelled'] ?? 0);

    if ($totalParcel > 0) {
        if ($deliveryRate === null) {
            $deliveryRate = round(($totalDelivered / $totalParcel) * 100);
        }
        if ($cancellationRate === null) {
            $cancellationRate = round(($totalCancelled / $totalParcel) * 100);
        }
    }

    $hasMeaningfulStats = $totalParcel > 0 || $deliveryRate !== null || $cancellationRate !== null || $volumeBand !== '' || $volumeRange !== '';
    if (!$hasMeaningfulStats) return null;

    return [
        'phone' => $phone,
        'delivery_rate' => $deliveryRate,
        'cancellation_rate' => $cancellationRate,
        'delivery_ratio' => $deliveryRate,
        'cancellation_ratio' => $cancellationRate,
        'return_ratio' => $cancellationRate,
        'total_fraud_report' => $fraudReports,
        'total_reports' => $fraudReports,
        'volume_band' => $volumeBand,
        'volume_range' => $volumeRange,
        'total_parcel' => $totalParcel,
        'total_delivered' => $totalDelivered,
        'total_cancelled' => $totalCancelled,
        'cached' => (bool)$cached,
        'fetched_at' => $fetchedAt ?: ($decoded['updatedAt'] ?? $decoded['fetched_at'] ?? gmdate('c')),
        'raw' => $raw,
    ];
}

function steadfastReadLocalCache($phone, $ttlSeconds) {
    $cacheFile = rtrim(sys_get_temp_dir(), '/\\') . '/ishopbd_sf_fraud_' . md5($phone) . '.json';
    if (!file_exists($cacheFile) || (time() - filemtime($cacheFile)) >= $ttlSeconds) {
        return null;
    }
    $raw = @file_get_contents($cacheFile);
    if ($raw === false) return null;
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? steadfastParsePayload($phone, $decoded, true, $decoded['fetched_at'] ?? null) : null;
}

function steadfastWriteLocalCache($phone, $data) {
    $cacheFile = rtrim(sys_get_temp_dir(), '/\\') . '/ishopbd_sf_fraud_' . md5($phone) . '.json';
    @file_put_contents($cacheFile, json_encode($data), LOCK_EX);
}

function steadfastFirestoreBatchReadCache($phones, $ttlSeconds) {
    $found = [];
    if (empty($phones)) return $found;
    $ctx = steadfastGetFirestoreContext();
    if (empty($ctx['token'])) return $found;

    $docNames = [];
    foreach ($phones as $p) {
        $docNames[] = "projects/{$ctx['projectId']}/databases/(default)/documents/courier_fraud_cache/{$p}";
    }

    $url = "https://firestore.googleapis.com/v1/projects/{$ctx['projectId']}/databases/(default)/documents:batchGet";
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer {$ctx['token']}",
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode(['documents' => $docNames]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($code !== 200 || !$resp) return $found;
    $rows = json_decode($resp, true);
    if (!is_array($rows)) return $found;

    $nowMs = microtime(true) * 1000;
    $ttlMs = $ttlSeconds * 1000;

    foreach ($rows as $row) {
        if (empty($row['found']['fields'])) continue;
        $parts = explode('/', (string)($row['found']['name'] ?? ''));
        $phoneKey = end($parts);
        if (!$phoneKey) continue;

        $docData = firestoreDecodeValue(['mapValue' => ['fields' => $row['found']['fields']]]);
        if (!is_array($docData)) continue;

        $fetchedAtMs = isset($docData['fetchedAtMs']) ? floatval($docData['fetchedAtMs']) : 0;
        if ($fetchedAtMs <= 0 && !empty($docData['updatedAt'])) {
            $ts = strtotime((string)$docData['updatedAt']);
            if ($ts !== false) $fetchedAtMs = $ts * 1000;
        }
        if ($fetchedAtMs <= 0 || ($nowMs - $fetchedAtMs) > $ttlMs) {
            continue;
        }

        $parsed = steadfastParsePayload($phoneKey, $docData, true, $docData['updatedAt'] ?? $docData['fetched_at'] ?? null);
        if ($parsed) {
            $found[$phoneKey] = $parsed;
            steadfastWriteLocalCache($phoneKey, $parsed);
        }
    }

    return $found;
}

function steadfastFirestoreWriteCache($phone, $data) {
    $ctx = steadfastGetFirestoreContext();
    if (empty($ctx['token'])) return;

    $docPayload = [
        'phone' => $phone,
        'delivery_rate' => $data['delivery_rate'],
        'cancellation_rate' => $data['cancellation_rate'],
        'delivery_ratio' => $data['delivery_ratio'],
        'cancellation_ratio' => $data['cancellation_ratio'],
        'return_ratio' => $data['return_ratio'],
        'total_fraud_report' => intval($data['total_fraud_report'] ?? 0),
        'total_reports' => intval($data['total_reports'] ?? 0),
        'volume_band' => strval($data['volume_band'] ?? ''),
        'volume_range' => strval($data['volume_range'] ?? ''),
        'total_parcel' => intval($data['total_parcel'] ?? 0),
        'total_delivered' => intval($data['total_delivered'] ?? 0),
        'total_cancelled' => intval($data['total_cancelled'] ?? 0),
        'fetchedAtMs' => (int)round(microtime(true) * 1000),
        'updatedAt' => strval($data['fetched_at'] ?? gmdate('c')),
    ];

    $encoded = firestoreEncodeValue($docPayload);
    $url = "https://firestore.googleapis.com/v1/projects/{$ctx['projectId']}/databases/(default)/documents/courier_fraud_cache/" . rawurlencode($phone);
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => 'PATCH',
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer {$ctx['token']}",
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode(['fields' => $encoded['mapValue']['fields'] ?? []]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 6,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    curl_exec($ch);
    curl_close($ch);
}

function callSteadfastApi($url, $apiKey, $secretKey) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_TIMEOUT => 12,
        CURLOPT_HTTPHEADER => [
            'Api-Key: ' . $apiKey,
            'Secret-Key: ' . $secretKey,
            'Content-Type: application/json',
        ],
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $httpCode, 'body' => $response];
}

function steadfastFetchLiveAndCache($phone, $apiKey, $secretKey) {
    $result = callSteadfastApi('https://portal.packzy.com/api/v1/fraud_check/score/' . urlencode($phone), $apiKey, $secretKey);
    if ($result['code'] === 404) {
        $result = callSteadfastApi('https://portal.packzy.com/api/v1/fraud_check/' . urlencode($phone), $apiKey, $secretKey);
    }

    $httpCode = intval($result['code']);
    $decoded = json_decode((string)$result['body'], true);

    if ($httpCode === 429) {
        steadfastSetCooldown(300);
        return [
            'ok' => false,
            'status' => 429,
            'error' => $decoded['message'] ?? $decoded['error'] ?? 'Steadfast courier search rate limit reached. Please retry shortly.',
        ];
    }

    if ($httpCode === 200 && is_array($decoded)) {
        $parsed = steadfastParsePayload($phone, $decoded, false, gmdate('c'));
        if ($parsed) {
            steadfastWriteLocalCache($phone, $parsed);
            steadfastFirestoreWriteCache($phone, $parsed);
            return ['ok' => true, 'status' => 200, 'data' => $parsed];
        }
    }

    return [
        'ok' => false,
        'status' => $httpCode >= 400 ? $httpCode : 500,
        'error' => $decoded['message'] ?? $decoded['error'] ?? 'Failed to fetch fraud status from Steadfast',
    ];
}

$cacheTtlSeconds = 24 * 60 * 60;

if ($isBatchRequest) {
    $body = json_decode(file_get_contents('php://input'), true) ?: [];
    $rawPhones = is_array($body['phones'] ?? null) ? $body['phones'] : [];
    $forceRefresh = !empty($body['forceRefresh']);

    $uniquePhones = [];
    foreach ($rawPhones as $rp) {
        $p = steadfastNormalizePhone($rp);
        if (strlen($p) >= 6 && !in_array($p, $uniquePhones, true)) {
            $uniquePhones[] = $p;
            if (count($uniquePhones) >= 25) break;
        }
    }

    $results = [];
    $errors = [];
    $cachedPhones = [];
    $fetchedPhones = [];
    $uncachedPhones = [];

    if (!$forceRefresh && !empty($uniquePhones)) {
        $missingLocal = [];
        foreach ($uniquePhones as $p) {
            $local = steadfastReadLocalCache($p, $cacheTtlSeconds);
            if ($local) {
                $results[$p] = $local;
                $cachedPhones[] = $p;
            } else {
                $missingLocal[] = $p;
            }
        }

        if (!empty($missingLocal)) {
            $fsCached = steadfastFirestoreBatchReadCache($missingLocal, $cacheTtlSeconds);
            foreach ($missingLocal as $p) {
                if (isset($fsCached[$p])) {
                    $results[$p] = $fsCached[$p];
                    $cachedPhones[] = $p;
                } else {
                    $uncachedPhones[] = $p;
                }
            }
        }
    } else {
        $uncachedPhones = $uniquePhones;
    }

    $rateLimited = steadfastGetCooldownRemaining() > 0;
    $maxLiveFetch = 4;
    if (!$rateLimited && !empty($uncachedPhones)) {
        list($apiKey, $secretKey) = steadfastResolveCredentials();
        if ($apiKey === '' || $secretKey === '') {
            foreach ($uncachedPhones as $p) {
                $errors[$p] = 'Steadfast API credentials missing on server.';
            }
        } else {
            $liveTargets = array_slice($uncachedPhones, 0, $maxLiveFetch);
            foreach ($liveTargets as $p) {
                $live = steadfastFetchLiveAndCache($p, $apiKey, $secretKey);
                if ($live['ok']) {
                    $results[$p] = $live['data'];
                    $fetchedPhones[] = $p;
                } else {
                    $errors[$p] = $live['error'];
                    if (intval($live['status']) === 429) {
                        $rateLimited = true;
                        break;
                    }
                }
            }
        }
    }

    echo json_encode([
        'success' => true,
        'results' => (object)$results,
        'errors' => (object)$errors,
        'cachedPhones' => $cachedPhones,
        'fetchedPhones' => $fetchedPhones,
        'rateLimited' => $rateLimited,
    ]);
    exit;
}

$phone = steadfastNormalizePhone($_GET['phone'] ?? '');
if ($phone === '' || strlen($phone) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Valid phone number required']);
    exit;
}

$forceRefresh = isset($_GET['refresh']) && ($_GET['refresh'] === '1' || $_GET['refresh'] === 'true');

if (!$forceRefresh) {
    $local = steadfastReadLocalCache($phone, $cacheTtlSeconds);
    if ($local) {
        echo json_encode(['success' => true, 'cached' => true, 'data' => $local]);
        exit;
    }

    $fsFound = steadfastFirestoreBatchReadCache([$phone], $cacheTtlSeconds);
    if (isset($fsFound[$phone])) {
        echo json_encode(['success' => true, 'cached' => true, 'data' => $fsFound[$phone]]);
        exit;
    }

    if (steadfastGetCooldownRemaining() > 0) {
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Steadfast courier search rate limit reached. Please retry shortly.']);
        exit;
    }
}

list($apiKey, $secretKey) = steadfastResolveCredentials();
if ($apiKey === '' || $secretKey === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Steadfast API credentials missing on server.']);
    exit;
}

$live = steadfastFetchLiveAndCache($phone, $apiKey, $secretKey);
if ($live['ok']) {
    echo json_encode(['success' => true, 'cached' => false, 'data' => $live['data']]);
} else {
    http_response_code($live['status']);
    echo json_encode(['success' => false, 'error' => $live['error']]);
}
?>
