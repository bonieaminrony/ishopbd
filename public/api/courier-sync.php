<?php
/**
 * i SHOP BD - Automated Courier Status Sync, Webhook & Admin Keys Fallback (PHP Parity)
 * Routes:
 *   POST /api/admin/courier/sync-all           (?action=sync-all)
 *   POST /api/admin/courier/sync/:orderId      (?action=sync-one&orderId=...)
 *   POST /api/courier/webhook/steadfast        (?action=webhook)
 *   GET  /api/pathao-status?id=...             (?action=pathao-status)
 *   POST /api/admin/keys                       (?action=save-keys)
 *   GET  /api/admin/keys                       (?action=get-keys)
 *   POST /api/admin/site-config                (?action=save-site-config)
 */

require_once __DIR__ . '/_marketing_lib.php';

marketingSetCorsHeaders('GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

function courierFirestoreRequest($method, $path, $body = null) {
    $sa = marketingGetServiceAccount();
    $projectId = $sa['project_id'] ?? (marketingGetEnvVar('FIREBASE_PROJECT_ID') ?: 'i-shop-bd');
    $token = marketingGetDatastoreToken($sa);
    if (!$token) {
        return ['code' => 500, 'data' => null, 'error' => 'Firestore service account token unavailable'];
    }
    $url = "https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/{$path}";
    $ch = curl_init($url);
    $opts = [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer $token",
            "Content-Type: application/json",
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 12,
        CURLOPT_SSL_VERIFYPEER => true,
    ];
    if ($body !== null) {
        $opts[CURLOPT_POSTFIELDS] = json_encode($body);
    }
    curl_setopt_array($ch, $opts);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $code, 'data' => json_decode($resp ?: '', true)];
}

function courierLoadKeys() {
    $keys = [
        'steadfastApiKey' => trim((string)marketingGetEnvVar('STEADFAST_API_KEY')),
        'steadfastSecretKey' => trim((string)marketingGetEnvVar('STEADFAST_SECRET_KEY')),
        'steadfastWebhookSecret' => trim((string)marketingGetEnvVar('STEADFAST_WEBHOOK_SECRET')),
        'pathaoClientId' => trim((string)marketingGetEnvVar('PATHAO_CLIENT_ID')),
        'pathaoClientSecret' => trim((string)marketingGetEnvVar('PATHAO_CLIENT_SECRET')),
        'pathaoUsername' => trim((string)marketingGetEnvVar('PATHAO_USERNAME')),
        'pathaoPassword' => trim((string)marketingGetEnvVar('PATHAO_PASSWORD')),
    ];
    $res = courierFirestoreRequest('GET', 'admin_config/keys');
    if ($res['code'] === 200 && isset($res['data']['fields'])) {
        $doc = firestoreDecodeValue(['mapValue' => ['fields' => $res['data']['fields']]]);
        foreach ($keys as $k => $v) {
            if (!empty($doc[$k])) $keys[$k] = trim((string)$doc[$k]);
        }
    }
    return $keys;
}

function courierEvaluateTransition($currentOrderStatus, $rawCourierStatus) {
    $cur = strtolower(trim((string)$currentOrderStatus ?: 'pending'));
    $norm = preg_replace('/[\s\-]+/', '_', strtolower(trim((string)$rawCourierStatus)));
    $rules = [
        'in_review' => ['booked', 'In Review (Booked)', 'shipped', ['pending', 'confirmed', 'processing', 'shipped']],
        'pending' => ['booked', 'Pending Pickup', 'shipped', ['pending', 'confirmed', 'processing', 'shipped']],
        'pickup_requested' => ['booked', 'Pickup Requested', 'shipped', ['pending', 'confirmed', 'processing', 'shipped']],
        'hold' => ['on_hold', 'On Hold', null, ['pending', 'confirmed', 'processing', 'shipped']],
        'on_hold' => ['on_hold', 'On Hold', null, ['pending', 'confirmed', 'processing', 'shipped']],
        'picked' => ['in_transit', 'Picked Up', 'shipped', ['pending', 'confirmed', 'processing', 'shipped']],
        'picked_up' => ['in_transit', 'Picked Up', 'shipped', ['pending', 'confirmed', 'processing', 'shipped']],
        'at_sorting_hub' => ['in_transit', 'At Sorting Hub', 'shipped', ['pending', 'confirmed', 'processing', 'shipped']],
        'in_transit' => ['in_transit', 'In Transit', 'shipped', ['pending', 'confirmed', 'processing', 'shipped']],
        'transit' => ['in_transit', 'In Transit', 'shipped', ['pending', 'confirmed', 'processing', 'shipped']],
        'delivery_ongoing' => ['in_transit', 'Out for Delivery', 'shipped', ['pending', 'confirmed', 'processing', 'shipped']],
        'delivered' => ['delivered', 'Delivered', 'delivered', ['pending', 'confirmed', 'processing', 'shipped']],
        'partial_delivered' => ['delivered', 'Partially Delivered', 'delivered', ['pending', 'confirmed', 'processing', 'shipped']],
        'partial_delivery' => ['delivered', 'Partially Delivered', 'delivered', ['pending', 'confirmed', 'processing', 'shipped']],
        'delivered_approval_pending' => ['delivered', 'Delivered (Approval Pending)', 'delivered', ['pending', 'confirmed', 'processing', 'shipped']],
        'cancelled' => ['cancelled', 'Cancelled', 'cancelled', ['pending', 'confirmed', 'processing', 'shipped', 'delivered']],
        'cancelled_by_customer' => ['cancelled', 'Cancelled by Customer', 'cancelled', ['pending', 'confirmed', 'processing', 'shipped', 'delivered']],
        'cancelled_by_merchant' => ['cancelled', 'Cancelled by Merchant', 'cancelled', ['pending', 'confirmed', 'processing', 'shipped', 'delivered']],
        'cancelled_approval_pending' => ['cancelled', 'Cancelled (Pending)', 'cancelled', ['pending', 'confirmed', 'processing', 'shipped', 'delivered']],
        'return' => ['returned', 'Returning', 'returned', ['pending', 'confirmed', 'processing', 'shipped', 'delivered']],
        'returned' => ['returned', 'Returned', 'returned', ['pending', 'confirmed', 'processing', 'shipped', 'delivered']],
        'return_received' => ['returned', 'Return Received', 'returned', ['pending', 'confirmed', 'processing', 'shipped', 'delivered']],
        'delivery_failed' => ['returned', 'Delivery Failed', 'returned', ['pending', 'confirmed', 'processing', 'shipped', 'delivered']],
        'failed' => ['returned', 'Delivery Failed', 'returned', ['pending', 'confirmed', 'processing', 'shipped', 'delivered']],
    ];
    if (!isset($rules[$norm])) {
        return ['should' => false, 'target' => null, 'cat' => 'unknown', 'label' => (string)$rawCourierStatus, 'protected' => false, 'reason' => 'Unknown status'];
    }
    [$cat, $label, $target, $allowed] = $rules[$norm];
    if ($cur === 'cancelled' || $cur === 'returned') {
        return ['should' => false, 'target' => null, 'cat' => $cat, 'label' => $label, 'protected' => true, 'reason' => "Protected terminal state: {$cur}"];
    }
    if ($cur === 'delivered' && !in_array($cat, ['returned', 'cancelled'], true)) {
        return ['should' => false, 'target' => null, 'cat' => $cat, 'label' => $label, 'protected' => true, 'reason' => 'Protected delivered order'];
    }
    if (!$target || $cur === $target || !in_array($cur, $allowed, true)) {
        return ['should' => false, 'target' => null, 'cat' => $cat, 'label' => $label, 'protected' => false, 'reason' => 'No status transition'];
    }
    return ['should' => true, 'target' => $target, 'cat' => $cat, 'label' => $label, 'protected' => false, 'reason' => "Courier status {$rawCourierStatus}"];
}

function courierFetchSteadfast($keys, $cid, $tid, $inv) {
    if (empty($keys['steadfastApiKey']) || empty($keys['steadfastSecretKey'])) {
        throw new Exception('Steadfast API keys not configured');
    }
    $paths = [];
    if ($cid && ctype_digit((string)$cid)) $paths[] = 'status_by_cid/' . rawurlencode($cid);
    if ($tid) {
        $p = ctype_digit((string)$tid) ? 'status_by_cid/' . rawurlencode($tid) : 'status_by_trackingcode/' . rawurlencode($tid);
        if (!in_array($p, $paths, true)) $paths[] = $p;
    }
    if ($inv) $paths[] = 'status_by_invoice/' . rawurlencode($inv);
    $lastHttpCode = 0;
    foreach ($paths as $path) {
        $ch = curl_init("https://portal.packzy.com/api/v1/{$path}");
        curl_setopt_array($ch, [
            CURLOPT_HTTPHEADER => [
                'Api-Key: ' . $keys['steadfastApiKey'],
                'Secret-Key: ' . $keys['steadfastSecretKey'],
                'Content-Type: application/json',
                'Accept: application/json',
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
        ]);
        $r = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $lastHttpCode = (int)$code;
        curl_close($ch);
        $dec = json_decode($r ?: '', true);
        $st = $dec['delivery_status'] ?? ($dec['status'] ?? null);
        if ($code === 200 && is_string($st) && $st !== '') {
            $msg = '';
            if (!empty($dec['tracking_message']) && is_string($dec['tracking_message'])) {
                $msg = trim($dec['tracking_message']);
            } elseif (!empty($dec['note']) && is_string($dec['note'])) {
                $msg = trim($dec['note']);
            }
            return ['rawStatus' => trim($st), 'trackingMessage' => $msg, 'rawResponse' => $dec];
        }
    }
    if ($lastHttpCode === 401) {
        throw new Exception('Steadfast 401 Unauthorized — এই Tracking/Invoice Steadfast প্যানেলে পাওয়া যায়নি অথবা API Key সঠিক নয়');
    }
    throw new Exception('Could not fetch Steadfast delivery status');
}

function courierGetPathaoToken($keys) {
    if (
        empty($keys['pathaoClientId']) ||
        empty($keys['pathaoClientSecret']) ||
        empty($keys['pathaoUsername']) ||
        empty($keys['pathaoPassword'])
    ) {
        throw new Exception('Pathao credentials are not configured.');
    }

    $cacheFile = sys_get_temp_dir() . '/ishopbd_pathao_tok_' . md5((string)$keys['pathaoClientId']) . '.json';
    if (file_exists($cacheFile)) {
        $cached = json_decode(@file_get_contents($cacheFile), true);
        if (is_array($cached) && !empty($cached['token']) && intval($cached['expiresAt'] ?? 0) > time()) {
            return $cached['token'];
        }
    }

    $ch = curl_init('https://api-hermes.pathao.com/aladdin/api/v1/issue-token');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Accept: application/json'],
        CURLOPT_POSTFIELDS => json_encode([
            'client_id' => $keys['pathaoClientId'],
            'client_secret' => $keys['pathaoClientSecret'],
            'username' => $keys['pathaoUsername'],
            'password' => $keys['pathaoPassword'],
            'grant_type' => 'password',
        ]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 12,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $r = curl_exec($ch);
    curl_close($ch);
    $dec = json_decode($r ?: '', true);
    $token = $dec['access_token'] ?? '';
    if ($token === '') {
        throw new Exception('Failed to authenticate with Pathao');
    }
    @file_put_contents($cacheFile, json_encode(['token' => $token, 'expiresAt' => time() + 45 * 60]));
    return $token;
}

function courierFetchPathao($keys, $tid) {
    $token = courierGetPathaoToken($keys);
    $ch = curl_init('https://api-hermes.pathao.com/aladdin/api/v1/orders/' . rawurlencode($tid) . '/track');
    curl_setopt_array($ch, [
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $token,
            'Accept: application/json',
            'Content-Type: application/json',
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 12,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $r = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $dec = json_decode($r ?: '', true);
    $orderObj = $dec['data']['order'] ?? ($dec['data'] ?? []);
    $st = $orderObj['order_status'] ?? ($orderObj['transfer_status'] ?? ($dec['data']['order_status'] ?? ''));
    if ($code < 200 || $code >= 300 || !is_string($st) || trim($st) === '') {
        throw new Exception($dec['message'] ?? 'Pathao returned no order status');
    }
    $logs = is_array($dec['data']['logs'] ?? null) ? $dec['data']['logs'] : [];
    $lastLog = !empty($logs) ? end($logs) : null;
    $msg = trim((string)(
        $orderObj['tracking_message']
        ?? $orderObj['order_status_desc']
        ?? $orderObj['reason']
        ?? ($lastLog['message'] ?? ($lastLog['status'] ?? ''))
    ));
    return ['rawStatus' => trim($st), 'trackingMessage' => $msg, 'rawResponse' => $dec];
}

function courierAppendHistoryEntry($existingHistory, $nextEntry, $maxEntries = 15) {
    $list = [];
    if (is_array($existingHistory)) {
        foreach ($existingHistory as $item) {
            if (is_array($item) && isset($item['status'])) {
                $list[] = $item;
            }
        }
    }
    $count = count($list);
    if ($count > 0) {
        $last = $list[$count - 1];
        $lastNorm = preg_replace('/[\s\-]+/', '_', strtolower(trim((string)($last['status'] ?? ''))));
        $nextNorm = preg_replace('/[\s\-]+/', '_', strtolower(trim((string)($nextEntry['status'] ?? ''))));
        $lastMsg = strtolower(trim((string)($last['message'] ?? '')));
        $nextMsg = strtolower(trim((string)($nextEntry['message'] ?? '')));
        if ($lastNorm === $nextNorm && $lastMsg === $nextMsg) {
            return array_slice($list, -$maxEntries);
        }
    }
    $list[] = $nextEntry;
    return array_slice($list, -$maxEntries);
}

function courierUpdateOrderFirestore($docId, $orderData, $service, $rawStatus, $source, $trackingMessage = '') {
    $eval = courierEvaluateTransition($orderData['status'] ?? 'pending', $rawStatus);
    $now = gmdate('c');
    $detailMsg = trim((string)$trackingMessage) !== '' ? trim((string)$trackingMessage) : $eval['reason'];
    $history = courierAppendHistoryEntry($orderData['courierHistory'] ?? [], [
        'status' => $rawStatus,
        'label' => $eval['label'],
        'category' => $eval['cat'],
        'message' => $detailMsg,
        'source' => $source,
        'timestamp' => $now,
    ]);
    $fields = [
        'courierStatus' => firestoreEncodeValue($rawStatus),
        'courierStatusNormalized' => firestoreEncodeValue($eval['cat']),
        'courierStatusLabel' => firestoreEncodeValue($eval['label']),
        'courierLastSyncedAt' => firestoreEncodeValue($now),
        'courierSyncSource' => firestoreEncodeValue($source),
        'courierStatusDetail' => firestoreEncodeValue($eval['reason']),
        'courierTrackingMessage' => firestoreEncodeValue($detailMsg),
        'courierHistory' => firestoreEncodeValue($history),
    ];
    if (stripos($service, 'pathao') !== false) {
        $fields['pathaoStatus'] = firestoreEncodeValue($rawStatus);
    } else {
        $fields['steadfastStatus'] = firestoreEncodeValue($rawStatus);
    }
    $newStatus = strtolower($orderData['status'] ?? 'pending');
    if ($eval['should'] && $eval['target']) {
        $newStatus = $eval['target'];
        $fields['status'] = firestoreEncodeValue($newStatus);
        if ($newStatus === 'cancelled' || $newStatus === 'returned') {
            $fields['paymentMethod'] = firestoreEncodeValue('N/A');
        }
    }
    $maskParams = implode('&', array_map(fn($k) => 'updateMask.fieldPaths=' . rawurlencode($k), array_keys($fields)));
    $patchRes = courierFirestoreRequest('PATCH', 'orders/' . rawurlencode($docId) . '?' . $maskParams, ['fields' => $fields]);
    if ($patchRes['code'] < 200 || $patchRes['code'] >= 300) {
        throw new Exception('Failed to save courier status to Firestore (HTTP ' . $patchRes['code'] . ')');
    }
    $oldStatus = strtolower($orderData['status'] ?? 'pending');
    $prevCourier = strtolower((string)($orderData['courierStatus'] ?? $orderData['steadfastStatus'] ?? $orderData['pathaoStatus'] ?? ''));
    return [
        'orderId' => $docId,
        'service' => $service,
        'rawCourierStatus' => $rawStatus,
        'courierLabel' => $eval['label'],
        'trackingMessage' => $detailMsg,
        'courierHistory' => $history,
        'oldOrderStatus' => $oldStatus,
        'newOrderStatus' => $newStatus,
        'updated' => ($newStatus !== $oldStatus) || ($prevCourier !== strtolower($rawStatus)),
        'syncedAt' => $now,
    ];
}

// Public Pathao live tracking proxy (/api/pathao-status?id=...)
if ($action === 'pathao-status' && $method === 'GET') {
    $tid = trim((string)($_GET['id'] ?? ''));
    if ($tid === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Tracking ID is required']);
        exit;
    }
    try {
        $keys = courierLoadKeys();
        $res = courierFetchPathao($keys, $tid);
        echo json_encode(['success' => true, 'data' => $res['rawResponse']], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

function courierFindOrderByField($fieldPath, $value) {
    $res = courierFirestoreRequest('POST', ':runQuery', [
        'structuredQuery' => [
            'from' => [['collectionId' => 'orders']],
            'where' => [
                'fieldFilter' => [
                    'field' => ['fieldPath' => $fieldPath],
                    'op' => 'EQUAL',
                    'value' => firestoreEncodeValue((string)$value),
                ],
            ],
            'limit' => 1,
        ],
    ]);
    if ($res['code'] === 200 && is_array($res['data']) && !empty($res['data'][0]['document']['name'])) {
        $doc = $res['data'][0]['document'];
        $parts = explode('/', $doc['name']);
        return [
            'id' => end($parts),
            'data' => firestoreDecodeValue(['mapValue' => ['fields' => $doc['fields'] ?? []]]),
        ];
    }
    return null;
}

// Inbound Steadfast webhook
if ($action === 'webhook' && $method === 'POST') {
    $keys = courierLoadKeys();
    $secret = trim((string)($keys['steadfastWebhookSecret'] ?? ''));
    $headerTok = $_SERVER['HTTP_X_STEADFAST_WEBHOOK_TOKEN'] ?? ($_SERVER['HTTP_X_WEBHOOK_TOKEN'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? ''));
    $headerTok = trim(preg_replace('/^Bearer\s+/i', '', $headerTok));
    if ($secret === '' || $headerTok === '' || !hash_equals($secret, $headerTok)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized webhook']);
        exit;
    }
    $body = json_decode(file_get_contents('php://input'), true) ?: [];
    $cid = $body['consignment_id'] ?? ($body['consignment']['consignment_id'] ?? '');
    $trackingCode = $body['tracking_code'] ?? ($body['consignment']['tracking_code'] ?? '');
    $invoice = $body['invoice'] ?? ($body['consignment']['invoice'] ?? '');
    $status = $body['status'] ?? ($body['delivery_status'] ?? ($body['consignment']['status'] ?? ''));
    $trackingMsg = trim((string)($body['tracking_message'] ?? ($body['message'] ?? ($body['consignment']['tracking_message'] ?? ''))));
    if ((!$invoice && !$trackingCode && !$cid) || !$status) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing identifier or status']);
        exit;
    }

    $matchedId = null;
    $orderData = null;
    if ($invoice !== '') {
        $docRes = courierFirestoreRequest('GET', 'orders/' . rawurlencode((string)$invoice));
        if ($docRes['code'] === 200 && !empty($docRes['data']['fields'])) {
            $matchedId = (string)$invoice;
            $orderData = firestoreDecodeValue(['mapValue' => ['fields' => $docRes['data']['fields']]]);
        }
    }
    if (!$matchedId && $trackingCode !== '') {
        foreach (['courierTrackingId', 'couriers.trackingId', 'trackingId'] as $f) {
            $found = courierFindOrderByField($f, $trackingCode);
            if ($found) { $matchedId = $found['id']; $orderData = $found['data']; break; }
        }
    }
    if (!$matchedId && $cid !== '') {
        foreach (['courierConsignmentId', 'courierTrackingId', 'couriers.consignmentId'] as $f) {
            $found = courierFindOrderByField($f, $cid);
            if ($found) { $matchedId = $found['id']; $orderData = $found['data']; break; }
        }
    }
    if (!$matchedId || !$orderData) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        exit;
    }
    $result = courierUpdateOrderFirestore($matchedId, $orderData, 'Steadfast', (string)$status, 'COURIER_WEBHOOK', $trackingMsg);
    echo json_encode(['success' => true, 'result' => $result], JSON_UNESCAPED_UNICODE);
    exit;
}

// Cron or Admin authorization check
$isCronAuthorized = false;
if ($action === 'cron') {
    $cronSecret = marketingGetEnvVar('COURIER_CRON_SECRET');
    $provided = $_GET['key'] ?? '';
    $isCronAuthorized = ($cronSecret !== '' && $provided !== '' && hash_equals($cronSecret, $provided));
}

if (!$isCronAuthorized && !marketingVerifyIsAdmin()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit;
}

if (($action === 'get-keys' || $action === 'keys') && $method === 'GET') {
    $res = courierFirestoreRequest('GET', 'admin_config/keys');
    $keysData = ($res['code'] === 200 && isset($res['data']['fields']))
        ? firestoreDecodeValue(['mapValue' => ['fields' => $res['data']['fields']]])
        : [];
    echo json_encode(['success' => true, 'keys' => $keysData], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($action === 'save-keys' || $action === 'keys') && $method === 'POST') {
    $incoming = json_decode(file_get_contents('php://input'), true) ?: [];
    $fields = [];
    foreach (['steadfastApiKey', 'steadfastSecretKey', 'steadfastWebhookSecret', 'geminiApiKey', 'pathaoClientId', 'pathaoClientSecret', 'pathaoUsername', 'pathaoPassword'] as $k) {
        $fields[$k] = firestoreEncodeValue((string)($incoming[$k] ?? ''));
    }
    $fields['updatedAt'] = firestoreEncodeValue(gmdate('c'));
    $mask = implode('&', array_map(fn($k) => 'updateMask.fieldPaths=' . rawurlencode($k), array_keys($fields)));
    $res = courierFirestoreRequest('PATCH', 'admin_config/keys?' . $mask, ['fields' => $fields]);
    if ($res['code'] >= 200 && $res['code'] < 300) {
        echo json_encode(['success' => true, 'message' => 'Keys updated successfully on server']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to save keys on server']);
    }
    exit;
}

if ($action === 'save-site-config' && $method === 'POST') {
    $incoming = json_decode(file_get_contents('php://input'), true);
    if (!is_array($incoming)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid payload']);
        exit;
    }
    $incoming['updatedAt'] = gmdate('c');
    $fields = [];
    foreach ($incoming as $k => $v) {
        $fields[(string)$k] = firestoreEncodeValue($v);
    }
    $mask = implode('&', array_map(fn($k) => 'updateMask.fieldPaths=' . rawurlencode($k), array_keys($fields)));
    $res = courierFirestoreRequest('PATCH', 'config/site?' . $mask, ['fields' => $fields]);
    if ($res['code'] >= 200 && $res['code'] < 300) {
        echo json_encode(['success' => true, 'message' => 'Site settings updated successfully on server']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to save site settings']);
    }
    exit;
}

if ($action === 'sync-one' && $method === 'POST') {
    $orderId = trim((string)($_GET['orderId'] ?? ''));
    if ($orderId === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'orderId required']);
        exit;
    }
    $docRes = courierFirestoreRequest('GET', 'orders/' . rawurlencode($orderId));
    if ($docRes['code'] !== 200 || empty($docRes['data']['fields'])) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Order not found']);
        exit;
    }
    $orderData = firestoreDecodeValue(['mapValue' => ['fields' => $docRes['data']['fields']]]);
    $tid = trim((string)($orderData['couriers']['trackingId'] ?? $orderData['courierTrackingId'] ?? $orderData['trackingId'] ?? ''));
    $cid = trim((string)($orderData['couriers']['consignmentId'] ?? $orderData['courierConsignmentId'] ?? ''));
    $svc = trim((string)($orderData['couriers']['service'] ?? $orderData['courierName'] ?? (!empty($orderData['pathaoStatus']) ? 'Pathao' : '')));
    if ($tid === '' && $cid === '' && stripos($svc, 'steadfast') === false && strtolower((string)($orderData['status'] ?? '')) !== 'shipped') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Order has no courier tracking ID']);
        exit;
    }
    $svc = $svc ?: 'Steadfast';
    $isPathao = stripos($svc, 'pathao') !== false;
    $keys = courierLoadKeys();
    try {
        if ($isPathao) {
            $fetched = courierFetchPathao($keys, $tid ?: $cid);
            $syncResult = courierUpdateOrderFirestore($orderId, $orderData, $svc, $fetched['rawStatus'], 'ADMIN_SINGLE_SYNC', $fetched['trackingMessage'] ?? '');
        } else {
            $fetched = courierFetchSteadfast($keys, $cid, $tid, $orderData['orderId'] ?? $orderId);
            $syncResult = courierUpdateOrderFirestore($orderId, $orderData, $svc ?: 'Steadfast', $fetched['rawStatus'], 'ADMIN_SINGLE_SYNC', $fetched['trackingMessage'] ?? '');
        }
        echo json_encode(['success' => true, 'syncResult' => $syncResult], JSON_UNESCAPED_UNICODE);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

if (($action === 'sync-all' || $action === 'cron')) {
    $keys = courierLoadKeys();
    $hasSteadfast = !empty($keys['steadfastApiKey']) && !empty($keys['steadfastSecretKey']);
    $hasPathao = !empty($keys['pathaoClientId']) && !empty($keys['pathaoClientSecret']) && !empty($keys['pathaoUsername']) && !empty($keys['pathaoPassword']);
    if (!$hasSteadfast && !$hasPathao) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Steadfast বা Pathao API Key কনফিগার করা নেই।',
            'summary' => ['total' => 0, 'synced' => 0, 'updated' => 0, 'failed' => 0, 'skipped' => 0],
            'results' => [],
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $body = json_decode(file_get_contents('php://input'), true) ?: [];
    $force = !empty($body['force']);
    $listRes = courierFirestoreRequest('GET', 'orders?pageSize=120&orderBy=' . rawurlencode('createdAt desc'));
    if ($listRes['code'] < 200 || $listRes['code'] >= 300 || !isset($listRes['data']['documents'])) {
        $listRes = courierFirestoreRequest('GET', 'orders?pageSize=120');
    }
    if ($listRes['code'] < 200 || $listRes['code'] >= 300) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to read orders from Firestore']);
        exit;
    }
    $docs = $listRes['data']['documents'] ?? [];
    $summary = ['total' => 0, 'synced' => 0, 'updated' => 0, 'failed' => 0, 'skipped' => 0];
    $results = [];

    foreach ($docs as $doc) {
        $parts = explode('/', $doc['name'] ?? '');
        $docId = end($parts);
        $data = firestoreDecodeValue(['mapValue' => ['fields' => $doc['fields'] ?? []]]);
        if (!empty($data['deleted'])) continue;
        $explicitTid = trim((string)($data['couriers']['trackingId'] ?? $data['courierTrackingId'] ?? ''));
        $legacyTid = trim((string)($data['trackingId'] ?? ''));
        $cid = trim((string)($data['couriers']['consignmentId'] ?? $data['courierConsignmentId'] ?? ''));
        $isOffline = stripos(trim((string)($data['orderId'] ?? '')), 'OFFLINE-') === 0;
        $tid = $explicitTid !== ''
            ? $explicitTid
            : (($cid === '' && ($isOffline || strpos($legacyTid, '#') === 0)) ? '' : $legacyTid);
        $st = strtolower((string)($data['status'] ?? ''));
        if ($tid === '' && $cid === '' && $st !== 'shipped') continue;
        if (!$force && ($st === 'cancelled' || $st === 'returned' || $st === 'delivered')) continue;

        $svc = trim((string)($data['couriers']['service'] ?? $data['courierName'] ?? (!empty($data['pathaoStatus']) ? 'Pathao' : 'Steadfast')));
        $isPathao = stripos($svc, 'pathao') !== false;
        $isSteadfast = stripos($svc, 'steadfast') !== false;
        if (($isPathao && !$hasPathao) || ($isSteadfast && !$hasSteadfast) || (!$isPathao && !$isSteadfast)) {
            continue;
        }

        $summary['total']++;
        try {
            if ($isPathao) {
                $fetched = courierFetchPathao($keys, $tid ?: $cid);
                $r = courierUpdateOrderFirestore($docId, $data, $svc, $fetched['rawStatus'], $action === 'cron' ? 'COURIER_BACKGROUND_SYNC' : 'ADMIN_MANUAL_SYNC', $fetched['trackingMessage'] ?? '');
            } else {
                $fetched = courierFetchSteadfast($keys, $cid, $tid, $data['orderId'] ?? $docId);
                $r = courierUpdateOrderFirestore($docId, $data, $svc ?: 'Steadfast', $fetched['rawStatus'], $action === 'cron' ? 'COURIER_BACKGROUND_SYNC' : 'ADMIN_MANUAL_SYNC', $fetched['trackingMessage'] ?? '');
            }
            $summary['synced']++;
            if ($r['updated']) $summary['updated']++;
            $results[] = $r;
        } catch (Exception $e) {
            $summary['failed']++;
            $results[] = ['orderId' => $docId, 'status' => 'ERROR', 'error' => $e->getMessage()];
        }
    }
    echo json_encode(['success' => true, 'summary' => $summary, 'results' => $results], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(404);
echo json_encode(['success' => false, 'error' => 'Invalid courier sync action']);
