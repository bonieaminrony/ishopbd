<?php
/**
 * i SHOP BD - Product image server with disk cache and compression.
 *
 * Product photos live in Firestore as base64. This script decodes a photo once, saves it under
 * api/img_cache/, and also saves a compressed copy (<name>.opt.webp, at most 900 px, quality 80).
 * The compressed copy is what gets sent: usually 5-10x smaller than the upload.
 *
 * .htaccess sends requests for photos that already have a compressed copy straight to the file,
 * so after the first visit PHP is not involved at all and Hostinger's CDN can cache them.
 *
 * ?v= is a fingerprint of the current photo. It is part of the cache name, so when the admin
 * changes a photo the new URL can never be answered with the old cached file.
 */

$rawId = isset($_GET['id']) ? trim(rawurldecode($_GET['id'])) : null;
// Accept both ?idx= (PHP) and ?index= (Node) gallery parameters
$idx = isset($_GET['idx']) ? (int)$_GET['idx'] : (isset($_GET['index']) ? (int)$_GET['index'] : null);
$variantIdx = isset($_GET['variant']) ? (int)$_GET['variant'] : null;
$version = isset($_GET['v']) ? preg_replace('/[^a-zA-Z0-9]/', '', substr((string)$_GET['v'], 0, 16)) : '';

if (!$rawId) {
    serveFallback();
    exit;
}

$parts = explode('-', $rawId);
$lastPart = end($parts);
$candidateId = (strlen($lastPart) >= 6) ? $lastPart : $rawId;
$safeId = preg_replace('/[^a-zA-Z0-9_-]/', '_', $candidateId);

$cacheDir = __DIR__ . '/img_cache';
if (!file_exists($cacheDir)) {
    @mkdir($cacheDir, 0755, true);
}

$idxSuffix = ($variantIdx !== null) ? "_var{$variantIdx}" : (($idx !== null) ? "_idx{$idx}" : "");
$verSuffix = ($version !== '') ? "_v{$version}" : "";
$cacheFilePrefix = $cacheDir . '/' . $safeId . $idxSuffix . $verSuffix;
$immutable = true; // every URL maps to one photo: a changed photo gets a new ?v= URL

// 1. Already on disk: send the compressed copy (made now if missing).
//    No trip to Firestore. (Unversioned photos used to be re-fetched every hour, which made some
//    photos, e.g. those that now exist only in this cache, take 2-4 seconds.)
$cachedFiles = imageFilesOnly(glob($cacheFilePrefix . '.*') ?: []);
if (!empty($cachedFiles)) {
    sendImageFile(bestCachedFile($cachedFiles), $immutable);
}

// Unversioned main-photo cache for this product, used as a last resort for versioned requests too
// (some products' photos exist ONLY in this cache: their Firestore photo was overwritten by an old bug).
$staleCachedFile = null;
$plainCache = imageFilesOnly(glob($cacheDir . '/' . $safeId . (($idx !== null) ? "_idx{$idx}" : "") . '.*') ?: []);
if (!empty($plainCache) && $variantIdx === null) {
    $staleCachedFile = bestCachedFile($plainCache);
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
    if ($variantIdx !== null && isset($fields['variants']['arrayValue']['values'][$variantIdx]['mapValue']['fields']['image']['stringValue'])) {
        $imageStr = trim($fields['variants']['arrayValue']['values'][$variantIdx]['mapValue']['fields']['image']['stringValue']);
    } elseif ($idx !== null && isset($fields['images']['arrayValue']['values'][$idx]['stringValue'])) {
        $imageStr = trim($fields['images']['arrayValue']['values'][$idx]['stringValue']);
    } elseif (isset($fields['image']['stringValue'])) {
        $imageStr = trim($fields['image']['stringValue']);
    }

    if ($imageStr) {
        if (preg_match('/^data:image\/([a-zA-Z0-9+]+);base64,(.*)$/', $imageStr, $matches)) {
            $ext = strtolower($matches[1]);
            $ext = ($ext === 'jpg' || $ext === 'jpeg') ? 'jpg' : (($ext === 'png') ? 'png' : 'webp');
            $imgBuffer = base64_decode($matches[2]);

            if ($imgBuffer && strlen($imgBuffer) > 100) {
                $savedFile = $cacheFilePrefix . '.' . $ext;
                $tmp = $savedFile . '.' . getmypid() . '.tmp';
                if (@file_put_contents($tmp, $imgBuffer) !== false && @rename($tmp, $savedFile)) {
                    sendImageFile(bestCachedFile([$savedFile]), $immutable);
                }
                @unlink($tmp);
                // Could not write the cache: send the photo as it is.
                header("Cache-Control: public, max-age=2592000, immutable");
                header("Content-Type: " . contentTypeFor($ext));
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
                sendImageFile($localUploadPath, true);
            }
        }
    }
}

if ($staleCachedFile && file_exists($staleCachedFile)) {
    sendImageFile($staleCachedFile, false);
}

serveFallback();

// ---------------------------------------------------------------------------------------------

/** Keep real image files; drop temp files and markers. */
function imageFilesOnly(array $files) {
    return array_values(array_filter($files, function ($f) {
        return preg_match('/\.(png|jpe?g|webp)$/i', $f) && !preg_match('/\.tmp$/i', $f);
    }));
}

function contentTypeFor($ext) {
    $ext = strtolower($ext);
    return ($ext === 'png') ? 'image/png' : (($ext === 'webp') ? 'image/webp' : 'image/jpeg');
}

/** The compressed copy if there is one (making it if possible), otherwise the original. */
function bestCachedFile(array $files) {
    foreach ($files as $f) {
        if (substr($f, -9) === '.opt.webp') return $f;
    }
    $original = $files[0];
    $optimized = optimizeImageFile($original);
    return $optimized ?: $original;
}

/**
 * Makes <name>.opt.webp: at most 900 px on the long side, WebP quality 80, transparency kept.
 * Returns its path, or null when this server cannot convert (the original is used instead).
 */
function optimizeImageFile($src) {
    if (substr($src, -9) === '.opt.webp') return $src;
    $dst = preg_replace('/\.(png|jpe?g|webp)$/i', '', $src) . '.opt.webp';
    if (file_exists($dst)) return $dst;
    if (file_exists($dst . '.skip')) return null;
    if (!function_exists('imagewebp') || !function_exists('imagecreatefromstring')) return null;

    $data = @file_get_contents($src);
    if ($data === false) return null;
    $im = @imagecreatefromstring($data); // animated images and odd formats fail here: keep original
    if (!$im) {
        @touch($dst . '.skip');
        return null;
    }
    $w = imagesx($im);
    $h = imagesy($im);
    $max = 900;
    if ($w > $max || $h > $max) {
        $r = min($max / $w, $max / $h);
        $nw = max(1, (int)round($w * $r));
        $nh = max(1, (int)round($h * $r));
        $out = imagecreatetruecolor($nw, $nh);
        imagealphablending($out, false);
        imagesavealpha($out, true);
        imagecopyresampled($out, $im, 0, 0, 0, 0, $nw, $nh, $w, $h);
        imagedestroy($im);
        $im = $out;
    } else {
        if (!imageistruecolor($im)) imagepalettetotruecolor($im);
        imagealphablending($im, false);
        imagesavealpha($im, true);
    }
    $tmp = $dst . '.' . getmypid() . '.tmp';
    $ok = @imagewebp($im, $tmp, 80);
    imagedestroy($im);
    if (!$ok || !file_exists($tmp) || filesize($tmp) < 100) {
        @unlink($tmp);
        @touch($dst . '.skip');
        return null;
    }
    // A small WebP upload can come out bigger; then the original is the better copy.
    if (strtolower(pathinfo($src, PATHINFO_EXTENSION)) === 'webp' && filesize($tmp) >= strlen($data)) {
        @unlink($tmp);
        if (@copy($src, $tmp) && @rename($tmp, $dst)) return $dst;
        @unlink($tmp);
        return null;
    }
    if (!@rename($tmp, $dst)) {
        @unlink($tmp);
        return file_exists($dst) ? $dst : null;
    }
    return $dst;
}

function sendImageFile($file, $immutable) {
    $etag = '"' . dechex((int)@filemtime($file)) . '-' . dechex((int)@filesize($file)) . '"';
    header("ETag: $etag");
    header($immutable ? "Cache-Control: public, max-age=2592000, immutable" : "Cache-Control: public, max-age=86400");
    if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag) {
        http_response_code(304);
        exit;
    }
    header("Content-Type: " . contentTypeFor(pathinfo($file, PATHINFO_EXTENSION)));
    header("Content-Length: " . filesize($file));
    readfile($file);
    exit;
}

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
