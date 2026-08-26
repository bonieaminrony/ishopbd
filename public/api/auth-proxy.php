<?php
/**
 * Firebase Auth Subdomain Proxy for Hostinger Custom Domains
 * This script forwards client auth handler and iframe requests to Firebase's default domain.
 */

// Prevent direct script errors or caching issues
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

$path = isset($_GET['path']) ? $_GET['path'] : '';

// The target Firebase default URL
$targetBaseUrl = 'https://rokomariponnohari-c6017.firebaseapp.com/__/auth/';
$targetUrl = $targetBaseUrl . $path;

// Forward query parameters if present
if (!empty($_SERVER['QUERY_STRING'])) {
    $queryParams = [];
    parse_str($_SERVER['QUERY_STRING'], $queryParams);
    // Remove the proxy routing query parameter 'path'
    unset($queryParams['path']);
    if (!empty($queryParams)) {
        $targetUrl .= '?' . http_build_query($queryParams);
    }
}

$ch = curl_init($targetUrl);

// Configure cURL options
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

// Forward the HTTP method
$method = $_SERVER['REQUEST_METHOD'];
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

// Forward POST requests payload
if ($method === 'POST') {
    $postData = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
}

// Forward client headers
$requestHeaders = [];
if (function_exists('getallheaders')) {
    $requestHeaders = getallheaders();
} else {
    foreach ($_SERVER as $name => $value) {
        if (substr($name, 0, 5) == 'HTTP_') {
            $key = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))));
            $requestHeaders[$key] = $value;
        }
    }
}

$headers = [];
foreach ($requestHeaders as $key => $value) {
    if (strtolower($key) === 'host') {
        continue; // Let cURL set the Host header correctly
    }
    $headers[] = "$key: $value";
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Execute request
$response = curl_exec($ch);

if ($response === false) {
    header("HTTP/1.1 502 Bad Gateway");
    echo "Auth Proxy Error: " . curl_error($ch);
    curl_close($ch);
    exit;
}

$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$responseHeaders = substr($response, 0, $headerSize);
$responseBody = substr($response, $headerSize);
curl_close($ch);

// Forward response headers back to client
$headerLines = explode("\r\n", $responseHeaders);
foreach ($headerLines as $line) {
    if (empty($line)) continue;
    $lowerLine = strtolower($line);
    
    // Skip headers that should be handled by Apache or the proxy itself
    if (strpos($lowerLine, 'transfer-encoding:') === 0 || 
        strpos($lowerLine, 'content-length:') === 0 || 
        strpos($lowerLine, 'connection:') === 0 ||
        strpos($lowerLine, 'http/') === 0) {
        continue;
    }
    header($line);
}

echo $responseBody;
