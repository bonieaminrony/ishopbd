<?php
/**
 * Google Merchant Center & Shopping XML Product Feed (/api/merchant-feed.xml)
 */
require_once __DIR__ . '/_catalog_seo.php';

header('Content-Type: application/xml; charset=UTF-8');
header('Cache-Control: public, max-age=1800, stale-while-revalidate=3600');
header('X-Content-Type-Options: nosniff');

$baseUrl = 'https://ishopbd.com';
$products = catalogLoadPublishedProducts();

function xmlEsc($str) {
    return htmlspecialchars((string)$str, ENT_XML1 | ENT_QUOTES, 'UTF-8');
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<rss version="2.0" xmlns:g="http://base.google.com/ns.0">' . "\n";
echo "  <channel>\n";
echo '    <title>' . xmlEsc('i SHOP BD Product Catalog') . "</title>\n";
echo '    <link>' . xmlEsc($baseUrl) . "</link>\n";
echo '    <description>' . xmlEsc('i SHOP BD (ishopbd.com) - Gadgets, Electronics, Fashion & Winter Koti Store in Bangladesh') . "</description>\n";

foreach ($products as $p) {
    $id = trim((string)($p['id'] ?? ''));
    if ($id === '') continue;
    $title = trim((string)($p['name'] ?? 'Product'));
    $slug = catalogProductSlug($p);
    $link = $baseUrl . '/p/' . rawurlencode($slug);
    $image = catalogProductImageUrl($p, $baseUrl);
    $priceNum = floatval($p['price'] ?? 0);
    $origNum = floatval($p['originalPrice'] ?? 0);
    $brand = trim((string)($p['brand'] ?? 'i SHOP BD'));
    $category = trim((string)($p['category'] ?? 'General'));
    $stock = catalogProductEffectiveStock($p);
    $availability = $stock > 0 ? 'in_stock' : (!empty($p['isComingSoon']) ? 'preorder' : 'out_of_stock');

    $descRaw = strip_tags((string)($p['shortDescription'] ?? $p['description'] ?? $title));
    $descClean = trim(preg_replace('/\s+/', ' ', $descRaw));
    if (mb_strlen($descClean, 'UTF-8') > 4900) {
        $descClean = mb_substr($descClean, 0, 4897, 'UTF-8') . '...';
    }

    echo "    <item>\n";
    echo '      <g:id>' . xmlEsc($id) . "</g:id>\n";
    echo '      <g:title>' . xmlEsc(mb_substr($title, 0, 150, 'UTF-8')) . "</g:title>\n";
    echo '      <g:description>' . xmlEsc($descClean ?: $title) . "</g:description>\n";
    echo '      <g:link>' . xmlEsc($link) . "</g:link>\n";
    echo '      <g:image_link>' . xmlEsc($image) . "</g:image_link>\n";
    echo "      <g:condition>new</g:condition>\n";
    echo '      <g:availability>' . $availability . "</g:availability>\n";
    if ($origNum > $priceNum && $priceNum > 0) {
        echo '      <g:price>' . number_format($origNum, 2, '.', '') . " BDT</g:price>\n";
        echo '      <g:sale_price>' . number_format($priceNum, 2, '.', '') . " BDT</g:sale_price>\n";
    } else {
        echo '      <g:price>' . number_format($priceNum, 2, '.', '') . " BDT</g:price>\n";
    }
    echo '      <g:brand>' . xmlEsc($brand !== '' ? $brand : 'i SHOP BD') . "</g:brand>\n";
    echo '      <g:product_type>' . xmlEsc($category) . "</g:product_type>\n";
    echo "      <g:shipping>\n";
    echo "        <g:country>BD</g:country>\n";
    echo '        <g:price>' . (!empty($p['isFreeDelivery']) ? '0.00' : '80.00') . " BDT</g:price>\n";
    echo "      </g:shipping>\n";
    echo "    </item>\n";
}

echo "  </channel>\n";
echo "</rss>\n";
