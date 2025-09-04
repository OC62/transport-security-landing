<?php
// Включаем автозагрузчик Composer
require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Загружаем переменные окружения из .env файла
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            
            // Удаляем кавычки если есть
            if (preg_match('/^"(.*)"$/', $value, $matches)) {
                $value = $matches[1];
            } elseif (preg_match('/^\'(.*)\'$/', $value, $matches)) {
                $value = $matches[1];
            }
            
            putenv("$name=$value");
            $_ENV[$name] = $value;
        }
    }
}

// Настройки CORS
$allowedOrigin = getenv('ALLOWED_ORIGIN') ?: 'https://xn----9sb8ajp.xn--p1ai';
header('Access-Control-Allow-Origin: ' . $allowedOrigin);
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

// Проверка происхождения запроса
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($requestOrigin && $requestOrigin !== $allowedOrigin) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Origin not allowed']);
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
$captchaSecret = getenv('CAPTCHA_SECRET') ?: '';

if (empty($captchaSecret)) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Captcha secret not configured']);
    exit();
}

// Проверка доступности API Яндекс Капчи
$apiCheck = @file_get_contents('https://smartcaptcha.yandexcloud.net/', false, stream_context_create([
    'ssl' => ['verify_peer' => false, 'verify_peer_name' => false],
    'http' => ['timeout' => 5]
]));

if ($apiCheck === false) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Captcha service unavailable. Please try again later.']);
    exit();
}

// Подготовка URL для проверки капчи
$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];
$captchaUrl = "https://smartcaptcha.yandexcloud.net/validate?secret=$captchaSecret&token=$captchaToken&ip=$ip";

// Отправка запроса к API Яндекс.Капчи
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $captchaUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
$captchaResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Captcha service unavailable']);
    exit();
}

$captchaResult = json_decode($captchaResponse, true);

if (!$captchaResult || $captchaResult['status'] !== 'ok') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Captcha validation failed: ' . ($captchaResult['message'] ?? 'Unknown error')]);
    exit();
}

// Настройки SMTP из .env
$smtpHost = getenv('SMTP_HOST') ?: 'smtp.gmail.com';
$smtpPort = getenv('SMTP_PORT') ?: 587;
$smtpSecure = getenv('SMTP_SECURE') ?: 'tls';
$smtpUser = getenv('SMTP_USER') ?: '';
$smtpPass = getenv('SMTP_PASS') ?: '';
$fromName = getenv('FROM_NAME') ?: 'Форма обратной связи ПТБ-М';
$toEmail = getenv('TO_EMAIL') ?: '';

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