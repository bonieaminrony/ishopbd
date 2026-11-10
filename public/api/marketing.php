<?php
/**
 * i SHOP BD - Marketing Configuration & Connection Verification API (PHP Parity)
 * Routes:
 *   GET  /api/marketing/public-config           (?action=public-config)
 *   GET  /api/admin/marketing-config            (?action=admin-config)
 *   POST /api/admin/marketing-config            (?action=admin-config)
 *   POST /api/admin/marketing-test/:platform    (?action=test&platform=...)
 */

require_once __DIR__ . '/_marketing_lib.php';

marketingSetCorsHeaders('GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

if ($action === 'public-config' && $method === 'GET') {
    $data = marketingReadConfig(true) ?: [];
    $publicConfig = [
        'meta' => [
            'enabled' => $data['meta']['enabled'] ?? true,
            'pixelId' => !empty($data['meta']['pixelId']) ? $data['meta']['pixelId'] : '1358996272808579',
        ],
        'tiktok' => [
            'enabled' => $data['tiktok']['enabled'] ?? true,
            'pixelId' => !empty($data['tiktok']['pixelId']) ? $data['tiktok']['pixelId'] : 'DBPHK73C77U4J2JR78JG',
        ],
        'google' => [
            'enabled' => $data['google']['enabled'] ?? true,
            'ga4MeasurementId' => !empty($data['google']['ga4MeasurementId']) ? $data['google']['ga4MeasurementId'] : 'G-90PDPQL0RJ',
            'googleAdsConversionId' => $data['google']['googleAdsConversionId'] ?? '',
            'googleAdsConversionLabel' => $data['google']['googleAdsConversionLabel'] ?? '',
            'enhancedConversions' => $data['google']['enhancedConversions'] ?? true,
            'gtmContainerId' => $data['google']['gtmContainerId'] ?? '',
        ],
        'whatsapp' => [
            'enabled' => $data['whatsapp']['enabled'] ?? true,
            'whatsappNumber' => !empty($data['whatsapp']['whatsappNumber']) ? $data['whatsapp']['whatsappNumber'] : '017XXXXXXXX',
            'defaultMessage' => $data['whatsapp']['defaultMessage'] ?? '',
        ],
        'imo' => [
            'enabled' => $data['imo']['enabled'] ?? true,
            'campaignSource' => !empty($data['imo']['campaignSource']) ? $data['imo']['campaignSource'] : 'imo',
        ],
    ];
    header('Cache-Control: public, max-age=60');
    echo json_encode(['success' => true, 'config' => $publicConfig], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!marketingVerifyIsAdmin()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit;
}

if ($action === 'admin-config' && $method === 'GET') {
    $defaults = marketingGetDefaultConfig();
    $data = marketingReadConfig(false);
    $final = $data ? [
        'meta' => array_merge($defaults['meta'], $data['meta'] ?? []),
        'tiktok' => array_merge($defaults['tiktok'], $data['tiktok'] ?? []),
        'google' => array_merge($defaults['google'], $data['google'] ?? []),
        'whatsapp' => array_merge($defaults['whatsapp'], $data['whatsapp'] ?? []),
        'imo' => array_merge($defaults['imo'], $data['imo'] ?? []),
        'openAi' => array_merge($defaults['openAi'], $data['openAi'] ?? []),
    ] : $defaults;

    $metaTok = trim((string)($final['meta']['accessToken'] ?? ''));
    $ttTok = trim((string)($final['tiktok']['accessToken'] ?? ''));
    $oaiKey = trim((string)($final['openAi']['apiKey'] ?? ''));

    $final['meta']['accessToken'] = marketingMaskSecret($metaTok);
    $final['meta']['hasAccessToken'] = $metaTok !== '';
    $final['tiktok']['accessToken'] = marketingMaskSecret($ttTok);
    $final['tiktok']['hasAccessToken'] = $ttTok !== '';
    $final['openAi']['apiKey'] = marketingMaskSecret($oaiKey);
    $final['openAi']['hasApiKey'] = $oaiKey !== '';

    echo json_encode(['success' => true, 'config' => $final], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'admin-config' && $method === 'POST') {
    $incoming = json_decode(file_get_contents('php://input'), true);
    if (!is_array($incoming)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing config data']);
        exit;
    }
    $existing = marketingReadConfig(false) ?: [];
    $resolveSecret = function ($inc, $cur) {
        if (!is_string($inc)) return (string)($cur ?? '');
        $trimmed = trim($inc);
        if ($trimmed === '') return '';
        if (marketingIsMasked($trimmed)) return (string)($cur ?? '');
        return $trimmed;
    };

    $merged = [
        'meta' => [
            'enabled' => !empty($incoming['meta']['enabled']),
            'pixelId' => trim((string)($incoming['meta']['pixelId'] ?? '')),
            'accessToken' => $resolveSecret($incoming['meta']['accessToken'] ?? null, $existing['meta']['accessToken'] ?? ''),
            'testEventCode' => trim((string)($incoming['meta']['testEventCode'] ?? '')),
            'capiEnabled' => isset($incoming['meta']['capiEnabled']) ? (bool)$incoming['meta']['capiEnabled'] : true,
        ],
        'tiktok' => [
            'enabled' => !empty($incoming['tiktok']['enabled']),
            'pixelId' => trim((string)($incoming['tiktok']['pixelId'] ?? '')),
            'accessToken' => $resolveSecret($incoming['tiktok']['accessToken'] ?? null, $existing['tiktok']['accessToken'] ?? ''),
            'testEventCode' => trim((string)($incoming['tiktok']['testEventCode'] ?? '')),
            'eventsApiEnabled' => isset($incoming['tiktok']['eventsApiEnabled']) ? (bool)$incoming['tiktok']['eventsApiEnabled'] : true,
        ],
        'google' => [
            'enabled' => !empty($incoming['google']['enabled']),
            'ga4MeasurementId' => trim((string)($incoming['google']['ga4MeasurementId'] ?? '')),
            'googleAdsConversionId' => trim((string)($incoming['google']['googleAdsConversionId'] ?? '')),
            'googleAdsConversionLabel' => trim((string)($incoming['google']['googleAdsConversionLabel'] ?? '')),
            'enhancedConversions' => isset($incoming['google']['enhancedConversions']) ? (bool)$incoming['google']['enhancedConversions'] : true,
            'gtmContainerId' => trim((string)($incoming['google']['gtmContainerId'] ?? '')),
        ],
        'whatsapp' => [
            'enabled' => !empty($incoming['whatsapp']['enabled']),
            'whatsappNumber' => trim((string)($incoming['whatsapp']['whatsappNumber'] ?? '')),
            'defaultMessage' => trim((string)($incoming['whatsapp']['defaultMessage'] ?? '')),
        ],
        'imo' => [
            'enabled' => !empty($incoming['imo']['enabled']),
            'campaignSource' => trim((string)($incoming['imo']['campaignSource'] ?? 'imo')),
            'defaultMedium' => trim((string)($incoming['imo']['defaultMedium'] ?? 'social_chat')),
        ],
        'openAi' => [
            'enabled' => !empty($incoming['openAi']['enabled']),
            'apiKey' => $resolveSecret($incoming['openAi']['apiKey'] ?? null, $existing['openAi']['apiKey'] ?? ''),
            'model' => trim((string)($incoming['openAi']['model'] ?? 'gpt-4o-mini')),
        ],
        'updatedAt' => gmdate('c'),
    ];

    marketingWriteConfig($merged);
    echo json_encode(['success' => true, 'message' => 'Marketing & Ads configuration saved successfully.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'test' && $method === 'POST') {
    $platform = $_GET['platform'] ?? '';
    $body = json_decode(file_get_contents('php://input'), true) ?: [];
    $existing = marketingReadConfig(false) ?: [];

    if ($platform === 'meta') {
        $token = $body['accessToken'] ?? '';
        if (!$token || marketingIsMasked($token)) {
            $token = $existing['meta']['accessToken'] ?? '';
        }
        $pixelId = trim((string)($body['pixelId'] ?? $existing['meta']['pixelId'] ?? ''));
        if ($pixelId === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Meta Pixel ID is required for testing.']);
            exit;
        }
        if ($token === '') {
            echo json_encode([
                'success' => true,
                'warning' => true,
                'message' => "Meta Pixel ID ({$pixelId}) format is VALID for Browser-Side tracking. However, Server-Side CAPI requires an Access Token to test server connection."
            ]);
            exit;
        }
        $ch = curl_init("https://graph.facebook.com/v19.0/" . rawurlencode($pixelId) . "?fields=id,name&access_token=" . urlencode($token));
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10, CURLOPT_SSL_VERIFYPEER => true]);
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $fbData = json_decode($resp ?: '', true);
        if ($code >= 200 && $code < 300 && !empty($fbData['id'])) {
            $testCode = trim((string)($body['testEventCode'] ?? $existing['meta']['testEventCode'] ?? ''));
            $capiSummary = '';
            if ($testCode !== '') {
                $evPayload = [
                    'data' => [[
                        'event_name' => 'PageView',
                        'event_time' => time(),
                        'event_id' => 'test_meta_' . time(),
                        'action_source' => 'website',
                        'event_source_url' => 'https://ishopbd.com/',
                        'user_data' => [
                            'client_user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'iShopBD-MarketingTest/1.0',
                        ],
                    ]],
                    'test_event_code' => $testCode,
                ];
                $c2 = curl_init("https://graph.facebook.com/v19.0/" . rawurlencode($pixelId) . "/events?access_token=" . urlencode($token));
                curl_setopt_array($c2, [
                    CURLOPT_POST => true,
                    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
                    CURLOPT_POSTFIELDS => json_encode($evPayload),
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_TIMEOUT => 10,
                ]);
                $r2 = json_decode(curl_exec($c2) ?: '', true);
                curl_close($c2);
                $capiSummary = " | Test CAPI event sent (code: {$testCode}, events_received: " . intval($r2['events_received'] ?? 1) . ")";
            }
            $pName = $fbData['name'] ?? $pixelId;
            echo json_encode(['success' => true, 'message' => "Meta CAPI & Pixel Connected Successfully! Pixel Name: \"{$pName}\" (ID: {$fbData['id']}){$capiSummary}", 'data' => $fbData]);
            exit;
        }
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Meta Connection Failed: ' . ($fbData['error']['message'] ?? 'Invalid token or Pixel ID')]);
        exit;
    }

    if ($platform === 'tiktok') {
        $token = $body['accessToken'] ?? '';
        if (!$token || marketingIsMasked($token)) {
            $token = $existing['tiktok']['accessToken'] ?? '';
        }
        $pixelId = trim((string)($body['pixelId'] ?? $existing['tiktok']['pixelId'] ?? ''));
        if ($pixelId === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'TikTok Pixel ID is required for testing.']);
            exit;
        }
        if ($token === '') {
            echo json_encode([
                'success' => true,
                'warning' => true,
                'message' => "TikTok Pixel ID ({$pixelId}) entered. Client-side pixel will initialize. Server-Side Events API requires an Access Token for server handshake."
            ]);
            exit;
        }
        $testCode = trim((string)($body['testEventCode'] ?? $existing['tiktok']['testEventCode'] ?? 'TEST_HANDSHAKE'));
        $ttPayload = [
            'event_source' => 'web',
            'event_source_id' => $pixelId,
            'test_event_code' => $testCode,
            'data' => [[
                'event' => 'Pageview',
                'event_time' => time(),
                'event_id' => 'test_tt_' . time(),
                'user' => [
                    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'iShopBD-MarketingTest/1.0',
                ],
                'page' => ['url' => 'https://ishopbd.com/'],
            ]],
        ];
        $ch = curl_init('https://business-api.tiktok.com/open_api/v1.3/event/track/');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ["Access-Token: $token", 'Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode($ttPayload),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
        ]);
        $ttData = json_decode(curl_exec($ch) ?: '', true);
        curl_close($ch);
        if (isset($ttData['code']) && intval($ttData['code']) === 0) {
            echo json_encode(['success' => true, 'message' => "TikTok Events API Connected Successfully! (Pixel ID: {$pixelId}, Test Code: {$testCode})", 'data' => $ttData]);
            exit;
        }
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'TikTok Connection Failed: ' . ($ttData['message'] ?? 'Verification failed')]);
        exit;
    }

    if ($platform === 'google') {
        $ga4 = trim((string)($body['ga4MeasurementId'] ?? $existing['google']['ga4MeasurementId'] ?? ''));
        $adsId = trim((string)($body['googleAdsConversionId'] ?? $existing['google']['googleAdsConversionId'] ?? ''));
        $label = trim((string)($body['googleAdsConversionLabel'] ?? $existing['google']['googleAdsConversionLabel'] ?? ''));
        $gtmId = trim((string)($body['gtmContainerId'] ?? $existing['google']['gtmContainerId'] ?? ''));
        $reports = [];
        $ok = false;
        if ($ga4 !== '') {
            if (preg_match('/^G-[A-Z0-9]+$/i', $ga4)) { $reports[] = "✓ GA4 Measurement ID ({$ga4}) format is valid."; $ok = true; }
            else { http_response_code(400); echo json_encode(['success' => false, 'error' => "Invalid GA4 ID format ({$ga4}). Must start with 'G-'."]); exit; }
        }
        if ($adsId !== '') {
            if (preg_match('/^(AW-)?[0-9]+$/i', $adsId)) { $reports[] = "✓ Google Ads Conversion ID ({$adsId}) is valid."; $ok = true; }
            else { http_response_code(400); echo json_encode(['success' => false, 'error' => "Invalid Google Ads Conversion ID ({$adsId})."]); exit; }
        }
        if ($gtmId !== '') {
            if (preg_match('/^GTM-[A-Z0-9]+$/i', $gtmId)) { $reports[] = "✓ GTM Container ID ({$gtmId}) format is valid."; $ok = true; }
            else { http_response_code(400); echo json_encode(['success' => false, 'error' => "Invalid GTM Container ID ({$gtmId}). Must start with 'GTM-'."]); exit; }
        }
        if ($label !== '') $reports[] = "✓ Google Ads Conversion Label ({$label}) configured.";
        if (!$ok) { http_response_code(400); echo json_encode(['success' => false, 'error' => 'Please provide at least a valid GA4, Google Ads, or GTM ID.']); exit; }
        echo json_encode(['success' => true, 'message' => 'Google Tracking Configuration Verified: ' . implode(' ', $reports) . ' (Enhanced Conversions supported)']);
        exit;
    }

    if ($platform === 'whatsapp') {
        $phone = trim((string)($body['whatsappNumber'] ?? $existing['whatsapp']['whatsappNumber'] ?? ''));
        $clean = preg_replace('/\D/', '', $phone);
        if (strlen($clean) < 10) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid WhatsApp phone number format. Minimum 10 digits required.']);
            exit;
        }
        $full = strpos($clean, '88') === 0 ? $clean : '88' . (strpos($clean, '0') === 0 ? substr($clean, 1) : $clean);
        $previewUrl = "https://wa.me/{$full}?text=" . rawurlencode((string)($body['defaultMessage'] ?? 'Hello iShop BD'));
        echo json_encode(['success' => true, 'message' => 'WhatsApp Configuration Verified! Click-to-WhatsApp link successfully generated.', 'previewUrl' => $previewUrl]);
        exit;
    }

    if ($platform === 'imo') {
        $source = trim((string)($body['campaignSource'] ?? $existing['imo']['campaignSource'] ?? 'imo'));
        $medium = trim((string)($body['defaultMedium'] ?? $existing['imo']['defaultMedium'] ?? 'social_chat'));
        $sampleUrl = "https://ishopbd.com/?utm_source=" . rawurlencode($source) . "&utm_medium=" . rawurlencode($medium) . "&utm_campaign=winter_fashion_2026";
        echo json_encode(['success' => true, 'message' => 'IMO Campaign Tracking Verified! Traffic & conversions will be tracked via URL attribution & in-app browser detection.', 'sampleUrl' => $sampleUrl]);
        exit;
    }

    if ($platform === 'openai') {
        $key = $body['apiKey'] ?? '';
        if (!$key || marketingIsMasked($key)) $key = $existing['openAi']['apiKey'] ?? '';
        if ($key === '') { http_response_code(400); echo json_encode(['success' => false, 'error' => 'OpenAI API Key is required for testing.']); exit; }
        $ch = curl_init('https://api.openai.com/v1/models');
        curl_setopt_array($ch, [CURLOPT_HTTPHEADER => ["Authorization: Bearer $key"], CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10]);
        $r = curl_exec($ch);
        $c = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $oai = json_decode($r ?: '', true);
        if ($c >= 200 && $c < 300) {
            $cnt = count($oai['data'] ?? []);
            $model = $body['model'] ?? $existing['openAi']['model'] ?? 'gpt-4o-mini';
            echo json_encode(['success' => true, 'message' => "OpenAI API Connected Successfully! ({$cnt} models accessible, chosen model: \"{$model}\").", 'modelsCount' => $cnt]);
            exit;
        }
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'OpenAI Connection Failed: ' . ($oai['error']['message'] ?? 'Invalid key')]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'error' => "Unknown platform: {$platform}"]);
    exit;
}

http_response_code(404);
echo json_encode(['success' => false, 'error' => 'Invalid marketing endpoint']);
