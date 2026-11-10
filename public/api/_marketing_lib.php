<?php
/**
 * i SHOP BD - Shared Marketing Config & Server-Side Tracking Helpers
 * Not directly web-accessible (blocked by .htaccess FilesMatch).
 */

function marketingSetCorsHeaders($methods = 'GET, POST, OPTIONS') {
    $allowedOrigins = [
        'https://ishopbd.com',
        'https://www.ishopbd.com',
        'https://ishopbd.online',
        'https://www.ishopbd.online',
        'http://localhost:5173',
        'http://localhost:3000',
    ];
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    if (in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header("Access-Control-Allow-Origin: https://ishopbd.com");
    }
    header("Access-Control-Allow-Methods: $methods");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Token, X-Requested-With");
    header("Content-Type: application/json; charset=UTF-8");
    header("X-Content-Type-Options: nosniff");
    header("X-Frame-Options: DENY");
    header("X-Robots-Tag: noindex, nofollow");
}

function marketingGetEnvVar($key, $default = '') {
    $paths = [
        dirname(__DIR__, 2) . '/.env',
        dirname(__DIR__, 1) . '/.env',
        ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/../.env',
        ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/.env',
    ];
    foreach ($paths as $path) {
        if (!$path) continue;
        $realPath = realpath($path);
        if ($realPath && file_exists($realPath)) {
            $lines = file($realPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '' || $line[0] === '#') continue;
                $parts = explode('=', $line, 2);
                if (count($parts) === 2 && trim($parts[0]) === $key) {
                    return trim(trim($parts[1]), "\"'");
                }
            }
        }
    }
    return $default;
}

function marketingGetServiceAccount() {
    $envJson = marketingGetEnvVar('FIREBASE_SERVICE_ACCOUNT_JSON');
    if (!empty($envJson)) {
        $decoded = json_decode($envJson, true);
        if ($decoded && !empty($decoded['client_email']) && !empty($decoded['private_key'])) {
            return $decoded;
        }
    }

    $clientEmail = marketingGetEnvVar('FIREBASE_CLIENT_EMAIL');
    $privateKey = marketingGetEnvVar('FIREBASE_PRIVATE_KEY');
    $projectId = marketingGetEnvVar('FIREBASE_PROJECT_ID') ?: marketingGetEnvVar('VITE_FIREBASE_PROJECT_ID', 'i-shop-bd');
    if (!empty($clientEmail) && !empty($privateKey)) {
        return [
            'client_email' => $clientEmail,
            'private_key' => str_replace('\n', "\n", $privateKey),
            'project_id' => $projectId,
            'token_uri' => 'https://oauth2.googleapis.com/token',
        ];
    }

    $candidates = [
        marketingGetEnvVar('FIREBASE_SERVICE_ACCOUNT_PATH'),
        dirname(__DIR__, 2) . '/api/service-account.json',
        dirname(__DIR__, 2) . '/service-account.json',
        ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/../api/service-account.json',
        realpath(__DIR__ . '/../../api/service-account.json') ?: '',
    ];
    foreach ($candidates as $candidate) {
        if (!empty($candidate) && file_exists($candidate)) {
            $cleanPath = str_replace('\\', '/', $candidate);
            if (strpos($cleanPath, '/public/') === false && strpos($cleanPath, '/dist/') === false) {
                $decoded = json_decode(file_get_contents($candidate), true);
                if ($decoded && !empty($decoded['client_email']) && !empty($decoded['private_key'])) {
                    return $decoded;
                }
            }
        }
    }
    return null;
}

function marketingGetDatastoreToken($sa) {
    if (!$sa || empty($sa['client_email']) || empty($sa['private_key'])) {
        return null;
    }

    $cacheFile = sys_get_temp_dir() . '/ishopbd_ds_token_' . md5($sa['client_email']) . '.json';
    if (file_exists($cacheFile)) {
        $cached = json_decode(@file_get_contents($cacheFile), true);
        if (is_array($cached) && !empty($cached['access_token']) && ($cached['expires_at'] ?? 0) > time() + 60) {
            return $cached['access_token'];
        }
    }

    $tokenUri = $sa['token_uri'] ?? 'https://oauth2.googleapis.com/token';
    $header = ['alg' => 'RS256', 'typ' => 'JWT'];
    if (!empty($sa['private_key_id'])) {
        $header['kid'] = $sa['private_key_id'];
    }
    $now = time();
    $claims = [
        'iss' => $sa['client_email'],
        'scope' => 'https://www.googleapis.com/auth/datastore',
        'aud' => $tokenUri,
        'exp' => $now + 3600,
        'iat' => $now,
    ];
    $b64H = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($header)));
    $b64C = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($claims)));
    $input = $b64H . '.' . $b64C;
    $sig = '';
    $priv = str_replace('\n', "\n", $sa['private_key']);
    if (!openssl_sign($input, $sig, $priv, 'SHA256')) {
        return null;
    }
    $jwt = $input . '.' . str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($sig));

    $ch = curl_init($tokenUri);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt,
        ]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $resp = curl_exec($ch);
    curl_close($ch);

    $decoded = json_decode($resp ?: '', true);
    if (!empty($decoded['access_token'])) {
        @file_put_contents($cacheFile, json_encode([
            'access_token' => $decoded['access_token'],
            'expires_at' => time() + intval($decoded['expires_in'] ?? 3500),
        ]));
        return $decoded['access_token'];
    }
    return null;
}

function firestoreDecodeValue($val) {
    if (!is_array($val)) return $val;
    if (array_key_exists('stringValue', $val)) return $val['stringValue'];
    if (array_key_exists('integerValue', $val)) return intval($val['integerValue']);
    if (array_key_exists('doubleValue', $val)) return floatval($val['doubleValue']);
    if (array_key_exists('booleanValue', $val)) return (bool)$val['booleanValue'];
    if (array_key_exists('timestampValue', $val)) return $val['timestampValue'];
    if (array_key_exists('nullValue', $val)) return null;
    if (isset($val['arrayValue'])) {
        $out = [];
        foreach (($val['arrayValue']['values'] ?? []) as $item) {
            $out[] = firestoreDecodeValue($item);
        }
        return $out;
    }
    if (isset($val['mapValue'])) {
        $out = [];
        foreach (($val['mapValue']['fields'] ?? []) as $k => $v) {
            $out[$k] = firestoreDecodeValue($v);
        }
        return $out;
    }
    return null;
}

function firestoreEncodeValue($val) {
    if ($val === null) return ['nullValue' => null];
    if (is_bool($val)) return ['booleanValue' => $val];
    if (is_int($val)) return ['integerValue' => (string)$val];
    if (is_float($val)) return ['doubleValue' => $val];
    if (is_string($val)) return ['stringValue' => $val];
    if (is_array($val)) {
        $isList = array_keys($val) === range(0, count($val) - 1);
        if ($isList && count($val) > 0) {
            $values = [];
            foreach ($val as $item) $values[] = firestoreEncodeValue($item);
            return ['arrayValue' => ['values' => $values]];
        }
        if ($isList && count($val) === 0) {
            return ['arrayValue' => ['values' => []]];
        }
        $fields = [];
        foreach ($val as $k => $v) {
            $fields[(string)$k] = firestoreEncodeValue($v);
        }
        return ['mapValue' => ['fields' => $fields]];
    }
    return ['stringValue' => (string)$val];
}

function marketingGetDefaultConfig() {
    return [
        'meta' => [
            'enabled' => true,
            'pixelId' => '1358996272808579',
            'accessToken' => '',
            'testEventCode' => '',
            'capiEnabled' => true,
        ],
        'tiktok' => [
            'enabled' => true,
            'pixelId' => 'DBPHK73C77U4J2JR78JG',
            'accessToken' => '',
            'testEventCode' => '',
            'eventsApiEnabled' => true,
        ],
        'google' => [
            'enabled' => true,
            'ga4MeasurementId' => 'G-90PDPQL0RJ',
            'googleAdsConversionId' => '',
            'googleAdsConversionLabel' => '',
            'enhancedConversions' => true,
            'gtmContainerId' => '',
        ],
        'whatsapp' => [
            'enabled' => true,
            'whatsappNumber' => '017XXXXXXXX',
            'defaultMessage' => 'হ্যালো iShop BD, আমি আপনার ওয়েবসাইট থেকে পণ্য অর্ডার করতে চাই।',
        ],
        'imo' => [
            'enabled' => true,
            'campaignSource' => 'imo',
            'defaultMedium' => 'social_chat',
        ],
        'openAi' => [
            'enabled' => false,
            'apiKey' => '',
            'model' => 'gpt-4o-mini',
        ],
    ];
}

function marketingReadConfig($useCache = true) {
    $tempCache = sys_get_temp_dir() . '/ishopbd_marketing_cfg.json';
    if ($useCache && file_exists($tempCache) && (time() - filemtime($tempCache)) < 30) {
        $cached = json_decode(@file_get_contents($tempCache), true);
        if (is_array($cached)) return $cached;
    }

    $sa = marketingGetServiceAccount();
    $projectId = $sa['project_id'] ?? (marketingGetEnvVar('FIREBASE_PROJECT_ID') ?: 'i-shop-bd');
    $token = marketingGetDatastoreToken($sa);

    if ($token) {
        $url = "https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/admin_config/marketing";
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_HTTPHEADER => ["Authorization: Bearer $token"],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($code === 200 && $resp) {
            $doc = json_decode($resp, true);
            if (isset($doc['fields'])) {
                $data = firestoreDecodeValue(['mapValue' => ['fields' => $doc['fields']]]);
                if (is_array($data)) {
                    @file_put_contents($tempCache, json_encode($data));
                    return $data;
                }
            }
        }
    }

    if (file_exists($tempCache)) {
        $cached = json_decode(@file_get_contents($tempCache), true);
        if (is_array($cached)) return $cached;
    }
    return null;
}

function marketingWriteConfig($payload) {
    $tempCache = sys_get_temp_dir() . '/ishopbd_marketing_cfg.json';
    @file_put_contents($tempCache, json_encode($payload));

    $sa = marketingGetServiceAccount();
    $projectId = $sa['project_id'] ?? (marketingGetEnvVar('FIREBASE_PROJECT_ID') ?: 'i-shop-bd');
    $token = marketingGetDatastoreToken($sa);
    if (!$token) {
        return false;
    }

    $fields = [];
    foreach ($payload as $k => $v) {
        $fields[(string)$k] = firestoreEncodeValue($v);
    }

    $url = "https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/admin_config/marketing";
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => 'PATCH',
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer $token",
            "Content-Type: application/json",
        ],
        CURLOPT_POSTFIELDS => json_encode(['fields' => $fields]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return $code >= 200 && $code < 300;
}

function marketingGetRequestHeader($name) {
    $upper = strtoupper(str_replace('-', '_', $name));
    foreach (["HTTP_{$upper}", "REDIRECT_HTTP_{$upper}", "REDIRECT_REDIRECT_HTTP_{$upper}"] as $serverKey) {
        if (!empty($_SERVER[$serverKey])) {
            return (string)$_SERVER[$serverKey];
        }
    }
    $headers = function_exists('getallheaders')
        ? getallheaders()
        : (function_exists('apache_request_headers') ? apache_request_headers() : []);
    if (is_array($headers)) {
        $target = strtolower($name);
        foreach ($headers as $k => $v) {
            if (strtolower((string)$k) === $target && $v !== '') {
                return (string)$v;
            }
        }
    }
    return '';
}

function marketingDecodeBase64Url($input) {
    $remainder = strlen($input) % 4;
    if ($remainder) {
        $input .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($input, '-_', '+/'));
}

function marketingVerifyFirebaseJwtLocal($idToken, $projectId) {
    $parts = explode('.', (string)$idToken);
    if (count($parts) !== 3) return null;

    $header = json_decode(marketingDecodeBase64Url($parts[0]), true);
    $claims = json_decode(marketingDecodeBase64Url($parts[1]), true);
    $sig = marketingDecodeBase64Url($parts[2]);
    if (!is_array($header) || !is_array($claims) || !$sig) return null;

    $kid = $header['kid'] ?? '';
    $alg = $header['alg'] ?? '';
    if ($alg !== 'RS256' || !$kid) return null;

    $now = time();
    $aud = $claims['aud'] ?? '';
    $iss = $claims['iss'] ?? '';
    $sub = $claims['sub'] ?? '';
    if ($aud !== $projectId || $iss !== "https://securetoken.google.com/{$projectId}" || !$sub) {
        return null;
    }
    if (intval($claims['exp'] ?? 0) < $now - 60 || intval($claims['iat'] ?? ($now + 999)) > $now + 300) {
        return null;
    }

    $certCacheFile = sys_get_temp_dir() . '/ishopbd_fb_x509_certs.json';
    $certs = null;
    if (file_exists($certCacheFile) && ($now - filemtime($certCacheFile)) < 3600) {
        $certs = json_decode(@file_get_contents($certCacheFile), true);
    }
    if (!is_array($certs) || empty($certs[$kid])) {
        $ch = curl_init('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($code === 200 && $resp) {
            $fetched = json_decode($resp, true);
            if (is_array($fetched)) {
                $certs = $fetched;
                @file_put_contents($certCacheFile, $resp);
            }
        }
    }

    if (!is_array($certs) || empty($certs[$kid])) return null;
    $pubKey = openssl_pkey_get_public($certs[$kid]);
    if (!$pubKey) return null;

    $verified = openssl_verify($parts[0] . '.' . $parts[1], $sig, $pubKey, OPENSSL_ALGO_SHA256);
    if ($verified !== 1) return null;

    return [
        'localId' => $sub,
        'email' => $claims['email'] ?? '',
    ];
}

function marketingVerifyIsAdmin() {
    $host = strtolower($_SERVER['HTTP_HOST'] ?? '');
    if (strpos($host, 'localhost') !== false || strpos($host, '127.0.0.1') !== false) {
        return true;
    }

    $masterPass = trim((string)marketingGetEnvVar('MASTER_ADMIN_PASSWORD'));
    $adminHeader = trim(marketingGetRequestHeader('X-Admin-Token'));
    if ($masterPass !== '' && $adminHeader !== '' && hash_equals($masterPass, $adminHeader)) {
        return true;
    }

    $authHeader = marketingGetRequestHeader('Authorization');
    if (stripos($authHeader, 'Bearer ') === 0) {
        $idToken = trim(substr($authHeader, 7));
        $sa = marketingGetServiceAccount();
        $projectId = $sa['project_id'] ?? (marketingGetEnvVar('FIREBASE_PROJECT_ID') ?: 'i-shop-bd');
        $user = marketingVerifyFirebaseJwtLocal($idToken, $projectId);

        if (!$user) {
            $apiKey = marketingGetEnvVar('VITE_FIREBASE_API_KEY') ?: 'AIzaSyClPZu-7eztcpTyOT0vVWX-znIwouTg7I8';
            $ch = curl_init("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" . urlencode($apiKey));
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_HTTPHEADER => [
                    "Content-Type: application/json",
                    "Referer: https://ishopbd.com/",
                ],
                CURLOPT_POSTFIELDS => json_encode(['idToken' => $idToken]),
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 8,
                CURLOPT_SSL_VERIFYPEER => true,
            ]);
            $resp = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($code === 200 && $resp) {
                $data = json_decode($resp, true);
                $user = $data['users'][0] ?? null;
            }
        }

        if ($user) {
            $email = strtolower(trim($user['email'] ?? ''));
            $cleanEmail = substr($email, -12) === '@mobile.user' ? substr($email, 0, -12) : $email;
            $masterEmails = [
                'bonieaminrony@gmail.com',
                'islamicsoktitv@gmail.com',
                'ishopbd.online@gmail.com',
                'ifilmbd2025@gmail.com',
            ];
            if (in_array($email, $masterEmails, true) || in_array($cleanEmail, $masterEmails, true)) {
                return true;
            }

            $dsToken = marketingGetDatastoreToken($sa);
            if ($dsToken) {
                $uid = $user['localId'] ?? '';
                foreach (array_filter([$uid, $email, $cleanEmail]) as $docId) {
                    $docUrl = "https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/admins/" . rawurlencode($docId);
                    $c = curl_init($docUrl);
                    curl_setopt_array($c, [
                        CURLOPT_HTTPHEADER => ["Authorization: Bearer $dsToken"],
                        CURLOPT_RETURNTRANSFER => true,
                        CURLOPT_TIMEOUT => 6,
                    ]);
                    $r = curl_exec($c);
                    $sc = curl_getinfo($c, CURLINFO_HTTP_CODE);
                    curl_close($c);
                    if ($sc === 200 && $r) {
                        $d = json_decode($r, true);
                        $role = $d['fields']['role']['stringValue'] ?? '';
                        if (in_array($role, ['admin', 'owner'], true)) {
                            return true;
                        }
                    }
                }
            }
        }
    }

    return false;
}

function marketingMaskSecret($str) {
    $trimmed = trim((string)$str);
    if ($trimmed === '') return '';
    if (strlen($trimmed) <= 8) return '••••••••';
    return substr($trimmed, 0, 4) . '••••••••' . substr($trimmed, -4);
}

function marketingIsMasked($str) {
    return is_string($str) && strpos($str, '••••') !== false;
}

function marketingNormalizePhoneDigits($phone) {
    if (!$phone || !is_string($phone)) return '';
    $bn = ['০'=>'0','১'=>'1','২'=>'2','৩'=>'3','৪'=>'4','৫'=>'5','৬'=>'6','৭'=>'7','৮'=>'8','৯'=>'9'];
    $ascii = strtr($phone, $bn);
    $digits = preg_replace('/\D/', '', $ascii);
    if (!$digits) return '';
    if (strpos($digits, '01') === 0 && strlen($digits) === 11) return '88' . $digits;
    if ($digits[0] === '1' && strlen($digits) === 10) return '880' . $digits;
    return $digits;
}

function marketingSha256($val) {
    $trimmed = strtolower(trim((string)$val));
    if ($trimmed === '') return null;
    return hash('sha256', $trimmed);
}
