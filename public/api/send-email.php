<?php
require_once __DIR__ . '/_marketing_lib.php';

marketingSetCorsHeaders('POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

if (!marketingVerifyIsAdmin()) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized access"]);
    exit;
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);

$to = isset($data['to']) ? str_replace(["\r", "\n"], '', trim((string)$data['to'])) : '';
$subject = isset($data['subject']) ? str_replace(["\r", "\n"], ' ', trim((string)$data['subject'])) : '';
$message = isset($data['message']) ? trim((string)$data['message']) : '';

if (empty($to) || empty($subject) || empty($message) || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid or missing email parameters"]);
    exit;
}

$emailUser = str_replace(["\r", "\n"], '', marketingGetEnvVar('EMAIL_USER', 'ishopbd.online@gmail.com'));
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
