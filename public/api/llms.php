<?php
/**
 * Dynamic /llms.txt generator for ChatGPT (OAI-SearchBot), Gemini, Perplexity & AI crawlers.
 */
require_once __DIR__ . '/_catalog_seo.php';

header('Content-Type: text/plain; charset=UTF-8');
header('Cache-Control: public, max-age=1800, stale-while-revalidate=3600');
header('X-Content-Type-Options: nosniff');

$baseUrl = 'https://ishopbd.com';
$products = catalogLoadPublishedProducts();

$out = [];
$out[] = '# i SHOP BD (আই শপ বিডি)';
$out[] = '';
$out[] = '> Authentic Online Gadget, Fashion, Winter Koti & Lifestyle E-Commerce Store in Bangladesh (`https://ishopbd.com`).';
$out[] = '';
$out[] = '## Store Policy & Delivery';
$out[] = '- Currency: BDT (৳)';
$out[] = '- Payment: Cash on Delivery (COD), bKash, Nagad nationwide across all 64 districts of Bangladesh';
$out[] = '- Delivery Fee: Inside Dhaka from ৳80, Outside Dhaka from ৳120-৳130 (free delivery on eligible products)';
$out[] = '- Catalog XML Feed: https://ishopbd.com/api/merchant-feed.xml';
$out[] = '- Sitemap: https://ishopbd.com/sitemap.xml';
$out[] = '';
$out[] = '## Active Products (' . count($products) . ')';
$out[] = '';

foreach ($products as $p) {
    $name = trim((string)($p['name'] ?? 'Product'));
    $slug = catalogProductSlug($p);
    $url = $baseUrl . '/p/' . rawurlencode($slug);
    $price = number_format(floatval($p['price'] ?? 0), 0, '.', '');
    $origPrice = floatval($p['originalPrice'] ?? 0);
    $category = trim((string)($p['category'] ?? 'General'));
    $brand = trim((string)($p['brand'] ?? 'i SHOP BD'));
    $stock = catalogProductEffectiveStock($p);
    $stockLabel = $stock > 0 ? 'In Stock' : (!empty($p['isComingSoon']) ? 'Pre-Order' : 'Out of Stock');
    $descRaw = strip_tags((string)($p['shortDescription'] ?? $p['metaDescription'] ?? $p['description'] ?? ''));
    $descClean = trim(preg_replace('/\s+/', ' ', $descRaw));
    if (mb_strlen($descClean, 'UTF-8') > 180) {
        $descClean = mb_substr($descClean, 0, 177, 'UTF-8') . '...';
    }
    $metaBits = ["Price: ৳{$price} BDT", "Category: {$category}", "Brand: {$brand}", "Availability: {$stockLabel}"];
    if ($origPrice > floatval($p['price'] ?? 0)) {
        $metaBits[] = 'Regular Price: ৳' . number_format($origPrice, 0, '.', '');
    }
    if (!empty($p['colors']) && is_array($p['colors'])) {
        $metaBits[] = 'Colors: ' . implode(', ', array_slice($p['colors'], 0, 6));
    }
    $out[] = "- [{$name}]({$url}) — " . implode(' | ', $metaBits) . ($descClean !== '' ? " — {$descClean}" : '');
}

echo implode("\n", $out) . "\n";
