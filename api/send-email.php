<?php
require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Загрузка .env файла
$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__));
$dotenv->load();

// Разрешенные домены для CORS
$allowedOrigins = [
    'https://xn----9sb8ajp.xn--p1ai',
    'https://www.xn----9sb8ajp.xn--p1ai'
];

// Настройки CORS
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($requestOrigin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $requestOrigin");
} else {
    header("Access-Control-Allow-Origin: " . $allowedOrigins[0]);
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Origin, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Обработка preflight OPTIONS запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Проверка метода запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

// Получение данных из тела запроса
$input = json_decode(file_get_contents('php://input'), true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON: ' . json_last_error_msg()]);
    exit();
}

if (!$input) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON data']);
    exit();
}

// Проверка наличия обязательных полей
$requiredFields = ['name', 'email', 'phone', 'message', 'smartcaptcha_token'];
foreach ($requiredFields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "Field $field is required"]);
        exit();
    }
}

// Валидация капчи
$captchaToken = $input['smartcaptcha_token'];
$captchaSecret = $_ENV['CAPTCHA_SECRET'] ?? '';

if (empty($captchaSecret)) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Captcha secret not configured']);
    exit();
}

// Проверка формата ключа
if (!preg_match('/^ysc2_[a-zA-Z0-9]{40}$/', $captchaSecret)) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Invalid captcha secret format']);
    exit();
}

// Подготовка данных для проверки капчи
$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];
$captchaData = [
    'secret' => $captchaSecret,
    'token' => $captchaToken,
    'ip' => $ip
];

// Отправка POST-запроса к API Яндекс.Капчи
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => 'https://smartcaptcha.yandexcloud.net/validate',
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($captchaData),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Accept: application/json'
    ]
]);

$captchaResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($httpCode !== 200) {
    error_log("Yandex Captcha API error: HTTP $httpCode - $curlError");
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Captcha service unavailable']);
    exit();
}

$captchaResult = json_decode($captchaResponse, true);

if (!$captchaResult) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Invalid response from captcha service']);
    exit();
}

if ($captchaResult['status'] !== 'ok') {
    $errorMessage = $captchaResult['message'] ?? 'Unknown error';
    error_log("Yandex Captcha validation failed: $errorMessage");
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => "Captcha validation failed: $errorMessage"]);
    exit();
}

// Настройки SMTP
$smtpHost = $_ENV['SMTP_HOST'] ?? 'smtp.gmail.com';
$smtpPort = (int) ($_ENV['SMTP_PORT'] ?? 587);
$smtpSecure = $_ENV['SMTP_SECURE'] ?? 'tls';
$smtpUser = $_ENV['SMTP_USER'] ?? '';
$smtpPass = $_ENV['SMTP_PASS'] ?? '';
$fromName = $_ENV['FROM_NAME'] ?? 'Форма обратной связи ПТБ-М';
$toEmail = $_ENV['TO_EMAIL'] ?? '';

try {
    // Создание экземпляра PHPMailer
    $mail = new PHPMailer(true);
    
    // Настройки сервера
    $mail->isSMTP();
    $mail->Host = $smtpHost;
    $mail->SMTPAuth = true;
    $mail->Username = $smtpUser;
    $mail->Password = $smtpPass;
    $mail->SMTPSecure = $smtpSecure;
    $mail->Port = $smtpPort;
    $mail->CharSet = 'UTF-8';
    
    // Настройки отправителя и получателя
    $mail->setFrom($smtpUser, $fromName);
    $mail->addAddress($toEmail);
    $mail->addReplyTo($input['email'], $input['name']);
    
    // Содержание письма
    $mail->isHTML(true);
    $mail->Subject = 'Новая заявка с сайта ПТБ-М';
    
    $messageBody = "
        <h2>Новая заявка с сайта</h2>
        <p><strong>Имя:</strong> " . htmlspecialchars($input['name']) . "</p>
        <p><strong>Email:</strong> " . htmlspecialchars($input['email']) . "</p>
        <p><strong>Телефон:</strong> " . htmlspecialchars($input['phone']) . "</p>
        <p><strong>Сообщение:</strong><br>" . nl2br(htmlspecialchars($input['message'])) . "</p>
        <p><strong>Время отправки:</strong> " . date('Y-m-d H:i:s') . "</p>
        <p><strong>IP адрес:</strong> " . $ip . "</p>
    ";
    
    $mail->Body = $messageBody;
    $mail->AltBody = strip_tags($messageBody);
    
    // Отправка письма
    $mail->send();
    
    // Успешный ответ
    echo json_encode([
        'status' => 'success', 
        'message' => 'Сообщение успешно отправлено. Мы свяжемся с вами в ближайшее время.'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    error_log("PHPMailer Error: " . $mail->ErrorInfo);
    echo json_encode([
        'status' => 'error', 
        'message' => "Ошибка при отправке сообщения. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону."
    ]);
}
?>