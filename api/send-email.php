<?php
// Убедитесь, что вывод JSON
header('Content-Type: application/json; charset=utf-8');

// Подключаем автозагрузчик Composer
require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Загружаем .env
$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__));
$dotenv->load();

// Настройки CORS
$allowedOrigins = [
    'https://xn----9sb8ajp.xn--p1ai',
    'https://www.xn----9sb8ajp.xn--p1ai'
];

$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($requestOrigin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $requestOrigin");
} else {
    header("Access-Control-Allow-Origin: " . $allowedOrigins[0]);
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Origin, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Обработка preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Проверка метода
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

// Получаем данные
$input = json_decode(file_get_contents('php://input'), true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
    exit();
}

if (!$input) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'No data']);
    exit();
}

// Проверка обязательных полей
$required = ['name', 'email', 'phone', 'message', 'smartcaptcha_token'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "Field $field is required"]);
        exit();
    }
}

// Проверка капчи
$captchaToken = $input['smartcaptcha_token'];
$captchaSecret = $_ENV['CAPTCHA_SECRET'] ?? '';

if (empty($captchaSecret)) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Captcha secret not configured']);
    exit();
}

$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];
$data = [
    'secret' => $captchaSecret,
    'token' => $captchaToken,
    'ip' => $ip
];

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => 'https://smartcaptcha.yandexcloud.net/validate',
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($data),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Accept: application/json'
    ]
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Captcha service unavailable']);
    exit();
}

$result = json_decode($response, true);

if (!$result || $result['status'] !== 'ok') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Captcha validation failed']);
    exit();
}

// Настройка PHPMailer
$mail = new PHPMailer(true);
$mail->isSMTP();
$mail->Host = $_ENV['SMTP_HOST'] ?? 'smtp.gmail.com';
$mail->SMTPAuth = true;
$mail->Username = $_ENV['SMTP_USER'] ?? '';
$mail->Password = $_ENV['SMTP_PASS'] ?? '';
$mail->SMTPSecure = $_ENV['SMTP_SECURE'] ?? 'tls';
$mail->Port = (int)($_ENV['SMTP_PORT'] ?? 587);
$mail->CharSet = 'UTF-8';

$mail->setFrom($_ENV['SMTP_USER'], $_ENV['FROM_NAME']);
$mail->addAddress($_ENV['TO_EMAIL']);
$mail->addReplyTo($input['email'], $input['name']);

$mail->isHTML(true);
$mail->Subject = 'Новая заявка с сайта ПТБ-М';

$body = "
    <h2>Новая заявка</h2>
    <p><strong>Имя:</strong> {$input['name']}</p>
    <p><strong>Email:</strong> {$input['email']}</p>
    <p><strong>Телефон:</strong> {$input['phone']}</p>
    <p><strong>Сообщение:</strong><br>" . nl2br(htmlspecialchars($input['message'])) . "</p>
    <p><strong>Время:</strong> " . date('Y-m-d H:i:s') . "</p>
    <p><strong>IP:</strong> $ip</p>
";

$mail->Body = $body;
$mail->AltBody = strip_tags($body);

try {
    $mail->send();
    echo json_encode(['status' => 'success', 'message' => 'Сообщение отправлено']);
} catch (Exception $e) {
    error_log("Mail error: " . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Ошибка отправки']);
}