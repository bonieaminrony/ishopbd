<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Function to parse .env file
function getEnvVar($key, $default = '') {
    $paths = [
        __DIR__ . '/.env',
        __DIR__ . '/../.env',
        __DIR__ . '/../../.env',
        $_SERVER['DOCUMENT_ROOT'] . '/.env',
        $_SERVER['DOCUMENT_ROOT'] . '/../.env'
    ];
    foreach ($paths as $path) {
        if (file_exists($path)) {
            $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line) || $line[0] === '#') continue;
                $parts = explode('=', $line, 2);
                if (count($parts) === 2) {
                    $name = trim($parts[0]);
                    $value = trim($parts[1]);
                    $value = trim($value, "\"'");
                    if ($name === $key) {
                        return $value;
                    }
                }
            }
        }
    }
    return $default;
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);

$to = isset($data['to']) ? trim($data['to']) : '';
$subject = isset($data['subject']) ? trim($data['subject']) : '';
$message = isset($data['message']) ? trim($data['message']) : '';

if (empty($to) || empty($subject) || empty($message)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing to, subject, or message"]);
    exit;
}

$emailUser = getEnvVar('EMAIL_USER', 'ishopbd.online@gmail.com');
$headers = "From: i SHOP BD <" . $emailUser . ">\r\n" .
           "Reply-To: " . $emailUser . "\r\n" .
           "Content-Type: text/plain; charset=UTF-8\r\n" .
           "X-Mailer: PHP/" . phpversion();

// Send using PHP's native mail() function
$mailSent = @mail($to, $subject, $message, $headers);

if ($mailSent) {
    echo json_encode(["success" => true, "message" => "Email sent successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to send email"]);
}
