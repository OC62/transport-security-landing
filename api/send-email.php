<?php
// api/send-email.php

// Подключаем .env вручную
$dotenvPath = __DIR__ . '/.env';
if (file_exists($dotenvPath)) {
    $lines = file($dotenvPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && $line[0] !== '#') {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            $value = trim($value, "\"'");
            $_ENV[$name] = $value;
        }
    }
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// CORS — исправленный домен
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://xn----9sb8ajp.xn--p1ai');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400');

// Обработка OPTIONS (pre-flight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Метод не разрешён']);
    exit;
}

require_once __DIR__ . '/phpmailer/PHPMailer.php';
require_once __DIR__ . '/phpmailer/SMTP.php';
require_once __DIR__ . '/phpmailer/Exception.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['name']) || !isset($data['email'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Недостаточно данных']);
    exit;
}

if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Некорректный email']);
    exit;
}

// Проверка капчи
$captchaToken = $data['smartcaptcha_token'] ?? '';
if (empty($captchaToken)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Требуется подтвердить, что вы не робот']);
    exit;
}

$secretKey = $_ENV['CAPTCHA_SECRET'] ?? '';
if (empty($secretKey)) {
    error_log('CAPTCHA_SECRET не настроен');
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Ошибка сервера']);
    exit;
}

$ip = $_SERVER['REMOTE_ADDR'];
$url = "https://captcha-api.yandex.ru/validate?secret=" . urlencode($secretKey) .
       "&token=" . urlencode($captchaToken) .
       "&ip=" . urlencode($ip);

$response = file_get_contents($url);
$captchaResult = json_decode($response);

if ($captchaResult === null || !$captchaResult->success) {
    error_log('Ошибка капчи: ' . ($response ?: 'пустой ответ'));
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Неверная капча']);
    exit;
}

try {
    $mail = new PHPMailer(true);

    $mail->isSMTP();
    $mail->Host       = $_ENV['SMTP_HOST'] ?? 'smtp.gmail.com';
    $mail->Port       = (int)($_ENV['SMTP_PORT'] ?? 587);
    $mail->SMTPAuth   = true;
    $mail->Username   = $_ENV['SMTP_USER'];
    $mail->Password   = $_ENV['SMTP_PASS'];
    $mail->SMTPSecure = ($_ENV['SMTP_SECURE'] ?? 'tls') === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : false;
    $mail->CharSet    = 'UTF-8';

    $fromName = $_ENV['FROM_NAME'] ?? 'Форма обратной связи ПТБ-М';
    $toEmail  = $_ENV['TO_EMAIL'] ?? 'oc611164@gmail.com';

    $mail->setFrom($_ENV['SMTP_USER'], $fromName);
    $mail->addAddress($toEmail);
    $mail->addReplyTo($data['email'], $data['name']);

    $mail->isHTML(true);
    $mail->Subject = 'Новая заявка с сайта ПТБ-М.РФ';
    $mail->Body = "
        <h2>Новая заявка</h2>
        <p><strong>Имя:</strong> " . htmlspecialchars($data['name'] ?? '') . "</p>
        <p><strong>Email:</strong> " . htmlspecialchars($data['email'] ?? '') . "</p>
        <p><strong>Телефон:</strong> " . htmlspecialchars($data['phone'] ?? '') . "</p>
        <p><strong>Сообщение:</strong> " . htmlspecialchars($data['message'] ?? '') . "</p>
    ";

    $mail->send();
    echo json_encode(['status' => 'success', 'message' => 'Письмо отправлено']);
} catch (Exception $e) {
    error_log('PHPMailer Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Ошибка отправки: ' . $mail->ErrorInfo]);
}