<?php
/**
 * i SHOP BD - Unified Server-Side Tracking Endpoint (PHP Parity)
 * Receives browser-matched events with eventId and dispatches to Meta CAPI & TikTok Events API.
 */

require_once __DIR__ . '/_marketing_lib.php';

marketingSetCorsHeaders('POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit;
}

$eventName = $input['eventName'] ?? '';
$eventId = $input['eventId'] ?? '';
$allowed = ['PageView', 'ViewContent', 'AddToCart', 'AddToWishlist', 'InitiateCheckout', 'Purchase', 'Search', 'Contact'];

if (!in_array($eventName, $allowed, true) || !is_string($eventId) || trim($eventId) === '' || strlen($eventId) > 128) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid eventName or eventId']);
    exit;
}

// Short-lived deduplication file guard in temp dir
$dedupDir = sys_get_temp_dir() . '/ishopbd_ev_dedup';
if (!is_dir($dedupDir)) @mkdir($dedupDir, 0755, true);
$dedupFile = $dedupDir . '/' . md5($eventName . ':' . $eventId);
if (file_exists($dedupFile) && (time() - filemtime($dedupFile)) < 300) {
    echo json_encode(['success' => true, 'deduplicated' => true]);
    exit;
}
@touch($dedupFile);

$config = marketingReadConfig(true) ?: [];
$ud = is_array($input['userData'] ?? null) ? $input['userData'] : [];
$cd = is_array($input['customData'] ?? null) ? $input['customData'] : [];
$eventTime = isset($input['eventTime']) && is_numeric($input['eventTime']) ? intval($input['eventTime']) : time();
$eventSourceUrl = is_string($input['eventSourceUrl'] ?? null) ? $input['eventSourceUrl'] : ($_SERVER['HTTP_REFERER'] ?? '');
$referrer = is_string($input['referrer'] ?? null) ? $input['referrer'] : ($_SERVER['HTTP_REFERER'] ?? '');

$rawIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
$clientIp = trim(explode(',', $rawIp)[0]);
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

$fbp = $ud['fbp'] ?? ($_COOKIE['_fbp'] ?? '');
$fbc = $ud['fbc'] ?? ($_COOKIE['_fbc'] ?? '');
if (!$fbc && !empty($ud['fbclid'])) {
    $fbc = 'fb.1.' . $eventTime . '.' . trim((string)$ud['fbclid']);
}
$ttp = $ud['ttp'] ?? ($_COOKIE['_ttp'] ?? '');
$ttclid = $ud['ttclid'] ?? '';

$phoneDigits = marketingNormalizePhoneDigits($ud['phone'] ?? '');
$e164Phone = strlen($phoneDigits) >= 10 ? ('+' . $phoneDigits) : '';

$nameParts = preg_split('/\s+/', trim((string)($ud['name'] ?? '')), -1, PREG_SPLIT_NO_EMPTY);
$fn = $nameParts[0] ?? '';
$ln = count($nameParts) > 1 ? implode(' ', array_slice($nameParts, 1)) : '';
$cityClean = preg_replace('/[^a-z0-9\x{0980}-\x{09FF}]/ui', '', strtolower(trim((string)($ud['city'] ?? ''))));

$handles = [];
$metaResult = ['enabled' => false, 'sent' => false];
$ttResult = ['enabled' => false, 'sent' => false];

$metaCfg = $config['meta'] ?? [];
$metaPixel = trim((string)($metaCfg['pixelId'] ?? ''));
$metaToken = trim((string)($metaCfg['accessToken'] ?? ''));
if (!empty($metaCfg['enabled']) && ($metaCfg['capiEnabled'] ?? true) && $metaPixel !== '' && $metaToken !== '') {
    $metaResult['enabled'] = true;
    $userData = [];
    if ($clientIp && $clientIp !== '127.0.0.1' && $clientIp !== '::1') $userData['client_ip_address'] = $clientIp;
    if ($userAgent) $userData['client_user_agent'] = $userAgent;
    if ($fbp) $userData['fbp'] = $fbp;
    if ($fbc) $userData['fbc'] = $fbc;
    if (!empty($ud['email']) && ($emH = marketingSha256($ud['email']))) $userData['em'] = [$emH];
    if (strlen($phoneDigits) >= 10 && ($phH = marketingSha256($phoneDigits))) $userData['ph'] = [$phH];
    if ($fn && ($fnH = marketingSha256($fn))) $userData['fn'] = [$fnH];
    if ($ln && ($lnH = marketingSha256($ln))) $userData['ln'] = [$lnH];
    if ($cityClean && ($ctH = marketingSha256($cityClean))) $userData['ct'] = [$ctH];
    $userData['country'] = [marketingSha256('bd')];
    $extSrc = (!empty($ud['userId']) && $ud['userId'] !== 'guest') ? $ud['userId'] : $phoneDigits;
    if ($extSrc && ($extH = marketingSha256($extSrc))) $userData['external_id'] = [$extH];

    $customData = [];
    if (!empty($cd['currency'])) $customData['currency'] = $cd['currency'];
    elseif (isset($cd['value'])) $customData['currency'] = 'BDT';
    if (isset($cd['value']) && is_numeric($cd['value'])) $customData['value'] = floatval($cd['value']);
    if (!empty($cd['orderId'])) $customData['order_id'] = (string)$cd['orderId'];
    if (!empty($cd['contentIds']) && is_array($cd['contentIds'])) {
        $customData['content_ids'] = array_map('strval', $cd['contentIds']);
        $customData['content_type'] = 'product';
    }
    if (isset($cd['numItems'])) $customData['num_items'] = intval($cd['numItems']);
    if (!empty($cd['contents']) && is_array($cd['contents'])) {
        $customData['contents'] = array_map(function ($it) {
            return [
                'id' => (string)($it['id'] ?? ''),
                'quantity' => max(1, intval($it['quantity'] ?? 1)),
                'item_price' => floatval($it['price'] ?? 0),
            ];
        }, $cd['contents']);
    }

    $evObj = [
        'event_name' => $eventName,
        'event_time' => $eventTime,
        'event_id' => $eventId,
        'action_source' => 'website',
        'user_data' => $userData,
    ];
    if ($eventSourceUrl) $evObj['event_source_url'] = $eventSourceUrl;
    if (!empty($customData)) $evObj['custom_data'] = $customData;

    $metaPayload = ['data' => [$evObj]];
    $testCode = trim((string)($metaCfg['testEventCode'] ?? ''));
    if ($testCode !== '') $metaPayload['test_event_code'] = $testCode;

    $chMeta = curl_init("https://graph.facebook.com/v19.0/" . rawurlencode($metaPixel) . "/events?access_token=" . urlencode($metaToken));
    curl_setopt_array($chMeta, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($metaPayload),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
    ]);
    $handles['meta'] = $chMeta;
}

$ttCfg = $config['tiktok'] ?? [];
$ttPixel = trim((string)($ttCfg['pixelId'] ?? ''));
$ttToken = trim((string)($ttCfg['accessToken'] ?? ''));
if (!empty($ttCfg['enabled']) && ($ttCfg['eventsApiEnabled'] ?? true) && $ttPixel !== '' && $ttToken !== '') {
    $ttResult['enabled'] = true;
    $ttEventName = $eventName === 'PageView' ? 'Pageview' : $eventName;
    $ttUser = [];
    if ($clientIp && $clientIp !== '127.0.0.1' && $clientIp !== '::1') $ttUser['ip'] = $clientIp;
    if ($userAgent) $ttUser['user_agent'] = $userAgent;
    if ($ttp) $ttUser['ttp'] = $ttp;
    if ($ttclid) $ttUser['ttclid'] = $ttclid;
    if ($e164Phone && ($phH = marketingSha256($e164Phone))) $ttUser['phone'] = $phH;
    if (!empty($ud['email']) && ($emH = marketingSha256($ud['email']))) $ttUser['email'] = $emH;
    $extSrc = (!empty($ud['userId']) && $ud['userId'] !== 'guest') ? $ud['userId'] : $e164Phone;
    if ($extSrc && ($extH = marketingSha256($extSrc))) $ttUser['external_id'] = $extH;

    $props = [];
    if (!empty($cd['currency'])) $props['currency'] = $cd['currency'];
    elseif (isset($cd['value'])) $props['currency'] = 'BDT';
    if (isset($cd['value']) && is_numeric($cd['value'])) $props['value'] = floatval($cd['value']);
    if (!empty($cd['orderId'])) $props['order_id'] = (string)$cd['orderId'];
    if (!empty($cd['searchString'])) $props['query'] = (string)$cd['searchString'];
    if (!empty($cd['contents']) && is_array($cd['contents'])) {
        $props['content_type'] = 'product';
        $props['contents'] = array_map(function ($it) {
            return [
                'content_id' => (string)($it['id'] ?? ''),
                'content_type' => 'product',
                'content_name' => (string)($it['name'] ?? ''),
                'price' => floatval($it['price'] ?? 0),
                'quantity' => max(1, intval($it['quantity'] ?? 1)),
            ];
        }, $cd['contents']);
    }

    $ttEntry = [
        'event' => $ttEventName,
        'event_time' => $eventTime,
        'event_id' => $eventId,
        'user' => $ttUser,
    ];
    if ($eventSourceUrl || $referrer) {
        $ttEntry['page'] = array_filter([
            'url' => $eventSourceUrl ?: null,
            'referrer' => $referrer ?: null,
        ]);
    }
    if (!empty($props)) $ttEntry['properties'] = $props;

    $ttPayload = [
        'event_source' => 'web',
        'event_source_id' => $ttPixel,
        'data' => [$ttEntry],
    ];
    $ttTestCode = trim((string)($ttCfg['testEventCode'] ?? ''));
    if ($ttTestCode !== '') $ttPayload['test_event_code'] = $ttTestCode;

    $chTt = curl_init('https://business-api.tiktok.com/open_api/v1.3/event/track/');
    curl_setopt_array($chTt, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ["Access-Token: $ttToken", 'Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($ttPayload),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
    ]);
    $handles['tiktok'] = $chTt;
}

if (!empty($handles)) {
    $mh = curl_multi_init();
    foreach ($handles as $ch) curl_multi_add_handle($mh, $ch);
    $running = null;
    do {
        curl_multi_exec($mh, $running);
        if ($running) curl_multi_select($mh, 0.2);
    } while ($running > 0);

    if (isset($handles['meta'])) {
        $raw = curl_multi_getcontent($handles['meta']);
        $code = curl_getinfo($handles['meta'], CURLINFO_HTTP_CODE);
        $metaResult['status'] = $code;
        $dec = json_decode($raw ?: '', true);
        if ($code >= 200 && $code < 300) {
            $metaResult['sent'] = true;
            $metaResult['eventsReceived'] = $dec['events_received'] ?? null;
        } else {
            $metaResult['error'] = $dec['error']['message'] ?? 'Meta CAPI failed';
        }
        curl_multi_remove_handle($mh, $handles['meta']);
        curl_close($handles['meta']);
    }

    if (isset($handles['tiktok'])) {
        $raw = curl_multi_getcontent($handles['tiktok']);
        $code = curl_getinfo($handles['tiktok'], CURLINFO_HTTP_CODE);
        $ttResult['status'] = $code;
        $dec = json_decode($raw ?: '', true);
        if (isset($dec['code']) && intval($dec['code']) === 0) {
            $ttResult['sent'] = true;
        } else {
            $ttResult['error'] = $dec['message'] ?? 'TikTok Events API failed';
        }
        curl_multi_remove_handle($mh, $handles['tiktok']);
        curl_close($handles['tiktok']);
    }
    curl_multi_close($mh);
}

echo json_encode(['success' => true, 'meta' => $metaResult, 'tiktok' => $ttResult]);
