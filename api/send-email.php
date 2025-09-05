<?php
header('Access-Control-Allow-Origin: https://xn----9sb8ajp.xn--p1ai');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Обработка preflight запросов
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Загрузка автолоадера Composer и Dotenv
require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

// Загрузка переменных окружения
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Получение данных из переменных окружения
$SMTP_HOST = $_ENV['SMTP_HOST'];
$SMTP_PORT = $_ENV['SMTP_PORT'];
$SMTP_USER = $_ENV['SMTP_USER'];
$SMTP_PASS = $_ENV['SMTP_PASS'];
$FROM_NAME = $_ENV['FROM_NAME'];
$TO_EMAIL = $_ENV['TO_EMAIL'];
$CAPTCHA_SECRET = $_ENV['CAPTCHA_SECRET'];

// Получение данных из запроса
$input = json_decode(file_get_contents('php://input'), true);

// Валидация входных данных
if (!$input) {
    echo json_encode(['status' => 'error', 'message' => 'Неверный формат данных']);
    exit;
}

// Валидация капчи
$captcha_token = $input['smartcaptcha_token'] ?? '';
if (empty($captcha_token)) {
    echo json_encode(['status' => 'error', 'message' => 'Токен капчи отсутствует']);
    exit;
}

$captcha_url = "https://smartcaptcha.yandexcloud.net/validate?secret=$CAPTCHA_SECRET&token=$captcha_token&ip=".$_SERVER['REMOTE_ADDR'];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $captcha_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$captcha_response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code !== 200) {
    echo json_encode(['status' => 'error', 'message' => 'Ошибка подключения к сервису капчи']);
    exit;
}

$captcha_data = json_decode($captcha_response, true);

if (!$captcha_data || $captcha_data['status'] !== 'ok') {
    echo json_encode(['status' => 'error', 'message' => 'Ошибка проверки капчи']);
    exit;
}

// Валидация обязательных полей
$required_fields = ['name', 'email', 'phone', 'message'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        echo json_encode(['status' => 'error', 'message' => "Поле $field обязательно для заполнения"]);
        exit;
    }
}

// Отправка письма
$mail = new PHPMailer(true);

try {
    // Настройки SMTP
    $mail->isSMTP();
    $mail->Host = $SMTP_HOST;
    $mail->SMTPAuth = true;
    $mail->Username = $SMTP_USER;
    $mail->Password = $SMTP_PASS;
    $mail->SMTPSecure = 'tls';
    $mail->Port = $SMTP_PORT;
    $mail->CharSet = 'UTF-8';

    // Отправитель и получатель
    $mail->setFrom($SMTP_USER, $FROM_NAME);
    $mail->addAddress($TO_EMAIL);
    
    // Содержание письма
    $mail->isHTML(true);
    $mail->Subject = 'Новое сообщение с сайта ПТБ-М';
    $mail->Body = "
        <h2>Новое сообщение с формы обратной связи</h2>
        <p><strong>Имя:</strong> " . htmlspecialchars($input['name']) . "</p>
        <p><strong>Email:</strong> " . htmlspecialchars($input['email']) . "</p>
        <p><strong>Телефон:</strong> " . htmlspecialchars($input['phone']) . "</p>
        <p><strong>Сообщение:</strong> " . nl2br(htmlspecialchars($input['message'])) . "</p>
        <p><strong>Время отправки:</strong> " . date('d.m.Y H:i') . "</p>
    ";

    $mail->send();
    echo json_encode(['status' => 'success', 'message' => 'Сообщение отправлено']);
} catch (Exception $e) {
    error_log("PHPMailer Error: " . $mail->ErrorInfo);
    echo json_encode(['status' => 'error', 'message' => 'Ошибка отправки сообщения']);
}