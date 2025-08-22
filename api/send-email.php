<?php
// api/send-email.php

// Подключаем библиотеку для .env
$dotenvPath = __DIR__ . '/.env';

if (file_exists($dotenvPath)) {
    $lines = file($dotenvPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && $line[0] !== '#') {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            // Удалить кавычки, если есть
            $value = trim($value, "\"'");
            $_ENV[$name] = $value;
        }
    }
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// === ИСПРАВЛЕНО: Убраны пробелы в домене ===
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://xn----9sb8ajp.xn--p1ai');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array('status' => 'error', 'message' => 'Метод не разрешён'));
    exit;
}

// Подключаем PHPMailer
require_once __DIR__ . '/phpmailer/PHPMailer.php';
require_once __DIR__ . '/phpmailer/SMTP.php';
require_once __DIR__ . '/phpmailer/Exception.php';

// Получаем данные
$data = json_decode(file_get_contents('php://input'), true);

// Валидация
if (!$data || !isset($data['name']) || !isset($data['email'])) {
    http_response_code(400);
    echo json_encode(array('status' => 'error', 'message' => 'Недостаточно данных'));
    exit;
}

if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(array('status' => 'error', 'message' => 'Некорректный email'));
    exit;
}

try {
    $mail = new PHPMailer(true);

    // === НАСТРОЙКИ ИЗ .ENV (БЕЗ ??, СОВМЕСТИМО С PHP 5.6) ===
    $mail->isSMTP();
    $mail->Host       = isset($_ENV['SMTP_HOST']) ? $_ENV['SMTP_HOST'] : 'smtp.gmail.com';
    $mail->Port       = isset($_ENV['SMTP_PORT']) ? (int)$_ENV['SMTP_PORT'] : 587;
    $mail->SMTPAuth   = true;
    $mail->Username   = $_ENV['SMTP_USER'];
    $mail->Password   = $_ENV['SMTP_PASS'];
    $mail->SMTPSecure = (isset($_ENV['SMTP_SECURE']) && $_ENV['SMTP_SECURE'] === 'tls') ? PHPMailer::ENCRYPTION_STARTTLS : false;
    $mail->CharSet    = 'UTF-8';
    // =======================================================

    // От кого и кому
    $fromName = isset($_ENV['FROM_NAME']) ? $_ENV['FROM_NAME'] : 'Форма обратной связи ПТБ-М';
    $toEmail  = isset($_ENV['TO_EMAIL']) ? $_ENV['TO_EMAIL'] : 'oc611164@gmail.com';

    $mail->setFrom($_ENV['SMTP_USER'], $fromName);
    $mail->addAddress($toEmail);
    $mail->addReplyTo($data['email'], $data['name']);

    // Тема и тело письма
    $mail->isHTML(true);
    $mail->Subject = 'Новая заявка с сайта ptb-m.ru';
    $mail->Body    = "
        <h2>Новая заявка</h2>
        <p><strong>Имя:</strong> " . (isset($data['name']) ? htmlspecialchars($data['name']) : 'Не указано') . "</p>
        <p><strong>Email:</strong> " . (isset($data['email']) ? htmlspecialchars($data['email']) : 'Не указано') . "</p>
        <p><strong>Телефон:</strong> " . (isset($data['phone']) ? htmlspecialchars($data['phone']) : 'Не указан') . "</p>
        <p><strong>Сообщение:</strong> " . (isset($data['message']) ? htmlspecialchars($data['message']) : 'Отсутствует') . "</p>
    ";

    $mail->send();
    echo json_encode(array('status' => 'success', 'message' => 'Письмо отправлено'));
} catch (Exception $e) {
    error_log('PHPMailer Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(array('status' => 'error', 'message' => 'Ошибка отправки: ' . $mail->ErrorInfo));
}