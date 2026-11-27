<?php
/**
 * /sitemap.xml (rewritten here by .htaccess). Built live from the product cache, so every
 * published product, category and subcategory is listed with its real last-change date.
 */
header('Content-Type: application/xml; charset=UTF-8');
header('Cache-Control: public, max-age=3600');
header('X-Robots-Tag: noindex');

require_once __DIR__ . '/_seo_lib.php';
require_once __DIR__ . '/_catalog_seo.php';

$products = array_values(array_filter(catalogLoadPublishedProducts(), 'seoIsPublished'));

function sitemapDate($value) {
    if (is_string($value) && preg_match('/^(\d{4}-\d{2}-\d{2})/', trim($value), $m)) return $m[1];
    if (is_array($value)) {
        $secs = $value['seconds'] ?? ($value['_seconds'] ?? null);
        if (is_numeric($secs) && $secs > 946684800) return gmdate('Y-m-d', (int)$secs);
    }
    if (is_numeric($value) && $value > 946684800000) return gmdate('Y-m-d', (int)($value / 1000));
    return null;
}

function sitemapProductDate($p) {
    return sitemapDate($p['updatedAt'] ?? null) ?: sitemapDate($p['createdAt'] ?? null);
}

$x = function ($s) { return htmlspecialchars((string)$s, ENT_XML1 | ENT_QUOTES, 'UTF-8'); };

$latest = null;
$byCategory = [];
$bySub = [];
foreach ($products as $p) {
    $d = sitemapProductDate($p);
    if ($d && (!$latest || $d > $latest)) $latest = $d;
    $c = $p['category'] ?? '';
    if ($c === '') continue;
    if ($d && (!isset($byCategory[$c]) || $d > $byCategory[$c])) $byCategory[$c] = $d;
    elseif (!isset($byCategory[$c])) $byCategory[$c] = null;
    $s = $p['subcategory'] ?? '';
    if ($s !== '') {
        $key = $c . "\0" . $s;
        if ($d && (!isset($bySub[$key]) || $d > $bySub[$key])) $bySub[$key] = $d;
        elseif (!isset($bySub[$key])) $bySub[$key] = null;
    }
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";

$url = function ($loc, $lastmod = null, $images = []) use ($x) {
    echo "  <url>\n    <loc>" . $x($loc) . "</loc>\n";
    if ($lastmod) echo "    <lastmod>{$lastmod}</lastmod>\n";
    foreach ($images as $img) {
        echo "    <image:image><image:loc>" . $x($img) . "</image:loc></image:image>\n";
    }
    echo "  </url>\n";
};

$url(SEO_SITE_URL . '/', $latest);

foreach (seoPublishedCategories($products) as $c) {
    $url(SEO_SITE_URL . seoCategoryPath($c), $byCategory[$c] ?? null);
}
foreach ($bySub as $key => $d) {
    [$c, $s] = explode("\0", $key, 2);
    $url(SEO_SITE_URL . seoCategoryPath($c, $s), $d);
}

foreach ($products as $p) {
    $images = [seoProductImageUrl($p)];
    foreach ((isset($p['images']) && is_array($p['images'])) ? $p['images'] : [] as $img) {
        if (!is_string($img)) continue;
        $abs = seoAbsoluteUrl($img, '');
        if ($abs !== '' && !in_array($abs, $images, true)) $images[] = $abs;
    }
    $url(SEO_SITE_URL . '/p/' . catalogProductSlug($p), sitemapProductDate($p), array_slice($images, 0, 5));
}

echo "</urlset>\n";
