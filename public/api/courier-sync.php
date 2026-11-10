<?php
/**
 * i SHOP BD - Automated Courier Status Sync, Webhook & Admin Keys Fallback (PHP Parity)
 * Routes:
 *   POST /api/admin/courier/sync-all           (?action=sync-all)
 *   POST /api/admin/courier/sync/:orderId      (?action=sync-one&orderId=...)
 *   POST /api/courier/webhook/steadfast        (?action=webhook)
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
        'steadfastApiKey' => marketingGetEnvVar('STEADFAST_API_KEY'),
        'steadfastSecretKey' => marketingGetEnvVar('STEADFAST_SECRET_KEY'),
        'steadfastWebhookSecret' => marketingGetEnvVar('STEADFAST_WEBHOOK_SECRET'),
        'pathaoClientId' => marketingGetEnvVar('PATHAO_CLIENT_ID'),
        'pathaoClientSecret' => marketingGetEnvVar('PATHAO_CLIENT_SECRET'),
        'pathaoUsername' => marketingGetEnvVar('PATHAO_USERNAME'),
        'pathaoPassword' => marketingGetEnvVar('PATHAO_PASSWORD'),
    ];
    $res = courierFirestoreRequest('GET', 'admin_config/keys');
    if ($res['code'] === 200 && isset($res['data']['fields'])) {
        $doc = firestoreDecodeValue(['mapValue' => ['fields' => $res['data']['fields']]]);
        foreach ($keys as $k => $v) {
            if (!empty($doc[$k])) $keys[$k] = $doc[$k];
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
        curl_close($ch);
        $dec = json_decode($r ?: '', true);
        $st = $dec['delivery_status'] ?? ($dec['status'] ?? null);
        if ($code === 200 && is_string($st) && $st !== '') {
            return $st;
        }
    }
    throw new Exception('Could not fetch Steadfast delivery status');
}

function courierUpdateOrderFirestore($docId, $orderData, $service, $rawStatus, $source) {
    $eval = courierEvaluateTransition($orderData['status'] ?? 'pending', $rawStatus);
    $now = gmdate('c');
    $fields = [
        'courierStatus' => firestoreEncodeValue($rawStatus),
        'courierStatusNormalized' => firestoreEncodeValue($eval['cat']),
        'courierStatusLabel' => firestoreEncodeValue($eval['label']),
        'courierLastSyncedAt' => firestoreEncodeValue($now),
        'courierSyncSource' => firestoreEncodeValue($source),
        'courierStatusDetail' => firestoreEncodeValue($eval['reason']),
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
    courierFirestoreRequest('PATCH', 'orders/' . rawurlencode($docId) . '?' . $maskParams, ['fields' => $fields]);
    $oldStatus = strtolower($orderData['status'] ?? 'pending');
    $prevCourier = strtolower((string)($orderData['courierStatus'] ?? $orderData['steadfastStatus'] ?? $orderData['pathaoStatus'] ?? ''));
    return [
        'orderId' => $docId,
        'service' => $service,
        'rawCourierStatus' => $rawStatus,
        'courierLabel' => $eval['label'],
        'oldOrderStatus' => $oldStatus,
        'newOrderStatus' => $newStatus,
        'updated' => ($newStatus !== $oldStatus) || ($prevCourier !== strtolower($rawStatus)),
        'syncedAt' => $now,
    ];
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
    $invoice = $body['invoice'] ?? ($body['consignment']['invoice'] ?? '');
    $status = $body['status'] ?? ($body['delivery_status'] ?? ($body['consignment']['status'] ?? ''));
    if (!$invoice || !$status) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing invoice or status']);
        exit;
    }
    $docRes = courierFirestoreRequest('GET', 'orders/' . rawurlencode((string)$invoice));
    if ($docRes['code'] !== 200 || empty($docRes['data']['fields'])) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        exit;
    }
    $orderData = firestoreDecodeValue(['mapValue' => ['fields' => $docRes['data']['fields']]]);
    $result = courierUpdateOrderFirestore((string)$invoice, $orderData, 'Steadfast', (string)$status, 'COURIER_WEBHOOK');
    echo json_encode(['success' => true, 'result' => $result]);
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
    foreach (['steadfastApiKey', 'steadfastSecretKey', 'geminiApiKey', 'pathaoClientId', 'pathaoClientSecret', 'pathaoUsername', 'pathaoPassword'] as $k) {
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
    if ($tid === '' && $cid === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Order has no courier tracking ID']);
        exit;
    }
    $keys = courierLoadKeys();
    try {
        $raw = courierFetchSteadfast($keys, $cid, $tid, $orderData['orderId'] ?? $orderId);
        $syncResult = courierUpdateOrderFirestore($orderId, $orderData, 'Steadfast', $raw, 'ADMIN_SINGLE_SYNC');
        echo json_encode(['success' => true, 'syncResult' => $syncResult]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

if (($action === 'sync-all' || $action === 'cron')) {
    $keys = courierLoadKeys();
    $listRes = courierFirestoreRequest('GET', 'orders?pageSize=120&orderBy=' . rawurlencode('createdAt desc'));
    $docs = $listRes['data']['documents'] ?? [];
    $summary = ['total' => 0, 'synced' => 0, 'updated' => 0, 'failed' => 0, 'skipped' => 0];
    $results = [];

    foreach ($docs as $doc) {
        $parts = explode('/', $doc['name'] ?? '');
        $docId = end($parts);
        $data = firestoreDecodeValue(['mapValue' => ['fields' => $doc['fields'] ?? []]]);
        if (!empty($data['deleted'])) continue;
        $tid = trim((string)($data['couriers']['trackingId'] ?? $data['courierTrackingId'] ?? $data['trackingId'] ?? ''));
        $cid = trim((string)($data['couriers']['consignmentId'] ?? $data['courierConsignmentId'] ?? ''));
        if ($tid === '' && $cid === '') continue;
        $st = strtolower((string)($data['status'] ?? ''));
        if ($st === 'cancelled' || $st === 'returned' || $st === 'delivered') continue;

        $summary['total']++;
        try {
            $raw = courierFetchSteadfast($keys, $cid, $tid, $data['orderId'] ?? $docId);
            $r = courierUpdateOrderFirestore($docId, $data, 'Steadfast', $raw, $action === 'cron' ? 'COURIER_BACKGROUND_SYNC' : 'ADMIN_MANUAL_SYNC');
            $summary['synced']++;
            if ($r['updated']) $summary['updated']++;
            $results[] = $r;
        } catch (Exception $e) {
            $summary['failed']++;
            $results[] = ['orderId' => $docId, 'status' => 'ERROR', 'error' => $e->getMessage()];
        }
    }
    echo json_encode(['success' => true, 'summary' => $summary, 'results' => $results]);
    exit;
}

http_response_code(404);
echo json_encode(['success' => false, 'error' => 'Invalid courier sync action']);
