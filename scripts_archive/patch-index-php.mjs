import * as ftp from 'basic-ftp';
import fs from 'fs';

async function run() {
  const client = new ftp.Client();
  try {
    await client.access({host: '187.127.183.159', user: 'u286107709', password: 'Aminbro@1122', secure: false});
    const remotePath = '/domains/ishopbd.com/public_html/index.php';
    const localPath = 'temp_index.php';
    
    await client.downloadTo(localPath, remotePath);
    let content = fs.readFileSync(localPath, 'utf8');
    
    // Check if schema code is already there to avoid duplicates
    if (!content.includes('Schema.org')) {
      const phpSchemaLogic = `
            // Add price, brand, stock parsing for Schema.org
            $price = 0;
            if (isset($data['fields']['price'])) {
                if (isset($data['fields']['price']['integerValue'])) {
                    $price = (int)$data['fields']['price']['integerValue'];
                } elseif (isset($data['fields']['price']['doubleValue'])) {
                    $price = (float)$data['fields']['price']['doubleValue'];
                } elseif (isset($data['fields']['price']['stringValue'])) {
                    $price = (float)$data['fields']['price']['stringValue'];
                }
            }
            
            $brand = isset($data['fields']['brand']['stringValue']) ? $data['fields']['brand']['stringValue'] : "i SHOP BD";
            
            $stockVal = 1;
            if (isset($data['fields']['stock'])) {
                if (isset($data['fields']['stock']['integerValue'])) {
                    $stockVal = (int)$data['fields']['stock']['integerValue'];
                } elseif (isset($data['fields']['stock']['doubleValue'])) {
                    $stockVal = (float)$data['fields']['stock']['doubleValue'];
                } elseif (isset($data['fields']['stock']['stringValue'])) {
                    $stockVal = (float)$data['fields']['stock']['stringValue'];
                }
            }
            $inStock = $stockVal > 0;
            
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
            if (isset($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
                $protocol = $_SERVER['HTTP_X_FORWARDED_PROTO'];
            }
            $host = $_SERVER['HTTP_HOST'];
            $currentUrl = "$protocol://$host" . $_SERVER['REQUEST_URI'];
            $imageUrl = "$protocol://$host/api/product-image/" . urlencode($productId);
            
            // Create schema
            $schemaObj = array(
                "@context" => "https://schema.org/",
                "@type" => "Product",
                "name" => $name,
                "image" => $imageUrl,
                "description" => $description,
                "brand" => array(
                    "@type" => "Brand",
                    "name" => $brand
                ),
                "offers" => array(
                    "@type" => "Offer",
                    "url" => $currentUrl,
                    "priceCurrency" => "BDT",
                    "price" => $price,
                    "availability" => $inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                    "itemCondition" => "https://schema.org/NewCondition"
                )
            );
            $schemaJson = json_encode($schemaObj, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            
            $nameEsc = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
            $descriptionEsc = htmlspecialchars($description, ENT_QUOTES, 'UTF-8');
            $currentUrlEsc = htmlspecialchars($currentUrl, ENT_QUOTES, 'UTF-8');
            
            // Inject Canonical URL
            if (strpos($html, '<!-- CANONICAL_URL_PLACEHOLDER -->') !== false) {
                $html = str_replace('<!-- CANONICAL_URL_PLACEHOLDER -->', '<link rel="canonical" href="' . $currentUrlEsc . '" />', $html);
            }
            
            // Inject Schema.org
            $html = preg_replace('/<\\/head>/i', "<script type=\\"application/ld+json\\">{$schemaJson}</script></head>", $html);
`;
      
      // Replace the previous block with the new one.
      // We look for the exact lines in index.php
      const regex = /\$protocol = isset\(\$_SERVER\['HTTPS'\]\).*?\$currentUrl = htmlspecialchars\(\$currentUrl, ENT_QUOTES, 'UTF-8'\);/s;
      content = content.replace(regex, phpSchemaLogic.trim());
      
      // Update variables used later in regex
      content = content.replace(/\{\$name\}/g, '{$nameEsc}');
      content = content.replace(/\{\$description\}/g, '{$descriptionEsc}');
      content = content.replace(/\{\$currentUrl\}/g, '{$currentUrlEsc}');
      
      const fallbackCanonical = `
} else {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    if (isset($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
        $protocol = $_SERVER['HTTP_X_FORWARDED_PROTO'];
    }
    $host = $_SERVER['HTTP_HOST'];
    $homeUrl = "$protocol://$host/";
    if (strpos($html, '<!-- CANONICAL_URL_PLACEHOLDER -->') !== false) {
        $html = str_replace('<!-- CANONICAL_URL_PLACEHOLDER -->', '<link rel="canonical" href="' . htmlspecialchars($homeUrl, ENT_QUOTES, 'UTF-8') . '" />', $html);
    }
}

echo $html;
`;
      content = content.replace(/}\r?\n\r?\necho \$html;/s, fallbackCanonical);
      
      fs.writeFileSync(localPath, content);
      await client.uploadFrom(localPath, remotePath);
      console.log('✅ Patched index.php for SEO');
    } else {
      console.log('⚠️ index.php already has Schema logic.');
    }
    
    console.log('📤 Uploading sitemap.xml...');
    await client.uploadFrom('public/sitemap.xml', '/domains/ishopbd.com/public_html/sitemap.xml');
    console.log('✅ sitemap.xml uploaded!');
    
    fs.unlinkSync(localPath);
  } catch(e) { console.error(e.message); }
  client.close();
}
run();
