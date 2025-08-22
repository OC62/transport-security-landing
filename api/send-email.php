<?php
// api/send-email.php

// Подключаем библиотеку для .env
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://xn----9sb8ajp.xn--p1ai');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Метод не разрешён']);
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
    echo json_encode(['status' => 'error', 'message' => 'Недостаточно данных']);
    exit;
}

if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Некорректный email']);
    exit;
}

try {
    $mail = new PHPMailer(true);

    // === НАСТРОЙКИ ИЗ .ENV ===
    $mail->isSMTP();
    $mail->Host       = $_ENV['SMTP_HOST'] ?? 'smtp.gmail.com';
    $mail->Port       = (int)($_ENV['SMTP_PORT'] ?? 587);
    $mail->SMTPAuth   = true;
    $mail->Username   = $_ENV['SMTP_USER'];
    $mail->Password   = $_ENV['SMTP_PASS'];
    $mail->SMTPSecure = $_ENV['SMTP_SECURE'] === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : false;
    $mail->CharSet    = 'UTF-8';
    // =======================

    // От кого и кому
    $mail->setFrom($_ENV['SMTP_USER'], $_ENV['FROM_NAME']);
    $mail->addAddress($_ENV['TO_EMAIL']);
    $mail->addReplyTo($data['email'], $data['name']);

    // Тема и тело письма
    $mail->isHTML(true);
    $mail->Subject = 'Новая заявка с сайта ptb-m.ru';
    $mail->Body    = "
        <h2>Новая заявка</h2>
        <p><strong>Имя:</strong> {$data['name']}</p>
        <p><strong>Email:</strong> {$data['email']}</p>
        <p><strong>Телефон:</strong> {$data['phone'] ?? 'Не указан'}</p>
        <p><strong>Сообщение:</strong> {$data['message'] ?? 'Отсутствует'}</p>
    ";

    $mail->send();
    echo json_encode(['status' => 'success', 'message' => 'Письмо отправлено']);
} catch (Exception $e) {
    error_log('PHPMailer Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Ошибка отправки: ' . $mail->ErrorInfo]);
}