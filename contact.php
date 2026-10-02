<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'method_not_allowed']);
    exit;
}

// Honeypot: real visitors never fill this hidden field, bots usually do.
// Pretend success so bots don't learn the field is being checked.
if (!empty($_POST['website'])) {
    echo json_encode(['success' => true]);
    exit;
}

function clean_field(string $value): string {
    // Strip CR/LF to prevent email header injection, and any HTML tags.
    $value = str_replace(["\r", "\n"], ' ', $value);
    return trim(strip_tags($value));
}

$name    = clean_field($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$date    = clean_field($_POST['date'] ?? '');
$guests  = clean_field($_POST['guests'] ?? '');
$message = trim(strip_tags($_POST['message'] ?? ''));

if ($name === '' || $email === '' || $date === '' || $guests === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'missing_fields']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'invalid_email']);
    exit;
}

$message = str_replace(["\r\n", "\r"], "\n", $message);

$to      = 'info@sunset-muehldorf.de';
$subject = 'Neue Reservierungsanfrage von ' . $name;

$body  = "Neue Reservierungsanfrage über die Website sunset-muehldorf.de\n\n";
$body .= "Name: {$name}\n";
$body .= "E-Mail: {$email}\n";
$body .= "Datum: {$date}\n";
$body .= "Personen: {$guests}\n\n";
$body .= "Nachricht:\n" . ($message !== '' ? $message : '(keine)') . "\n";

$headers   = [];
$headers[] = 'From: Sunset Website <noreply@sunset-muehldorf.de>';
$headers[] = 'Reply-To: ' . $email;
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'X-Mailer: PHP/' . phpversion();

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$sent = mail($to, $encodedSubject, $body, implode("\r\n", $headers));

if ($sent) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'send_failed']);
}
