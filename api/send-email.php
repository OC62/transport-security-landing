<?php
// Включаем автозагрузчик Composer
require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Загружаем переменные окружения из корневого .env файла
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

// Настройки CORS - без пробелов в домене
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
    error_log('CAPTCHA_SECRET is not configured in .env file');
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Captcha secret not configured']);
    exit();
}

// Получаем IP-адрес пользователя (обрабатываем прокси)
function getUserIp() {
    $ip = '';
    
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        // Берем первый IP из списка (если есть несколько)
        $ipList = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $ip = trim($ipList[0]);
    } else {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    
    return $ip;
}

$ip = getUserIp();

// Используем ПРАВИЛЬНЫЙ URL для проверки капчи
$captchaUrl = "https://captcha-api.yandex.ru/validate?secret=$captchaSecret&token=$captchaToken&ip=$ip";

// Отправка запроса к API Яндекс.Капчи
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $captchaUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
curl_setopt($ch, CURLOPT_CAINFO, __DIR__ . '/cacert.pem'); // Добавляем CA сертификат для проверки SSL
$captchaResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Логируем полный ответ для диагностики
error_log("Captcha API request: $captchaUrl");
error_log("Captcha API response (HTTP $httpCode): $captchaResponse");
if (!empty($curlError)) {
    error_log("Curl error: $curlError");
}

if ($httpCode !== 200) {
    error_log("Captcha API returned HTTP $httpCode");
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Captcha service unavailable']);
    exit();
}

$captchaResult = json_decode($captchaResponse, true);

// ПРАВИЛЬНАЯ проверка результата капчи
if (!$captchaResult || empty($captchaResult['success'])) {
    $errorMessage = $captchaResult['message'] ?? 'Unknown captcha error';
    error_log("Captcha validation failed: $errorMessage");
    
    // Дополнительная диагностика для ошибки "Некорректный ключ или срок его действия истек"
    if (strpos($errorMessage, 'expired') !== false || strpos($errorMessage, 'некорректный') !== false) {
        error_log("Possible cause: token expired or invalid secret key");
    }
    
    http_response_code(400);
    echo json_encode([
        'status' => 'error', 
        'message' => 'Неверная капча. Пожалуйста, пройдите проверку заново.',
        'captcha_error' => $errorMessage
    ]);
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
    
    // Правильная обработка SMTPSecure
    if ($smtpSecure === 'tls') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    } elseif ($smtpSecure === 'ssl') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    } else {
        $mail->SMTPSecure = false;
    }
    
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
    $errorMessage = "Ошибка при отправке: " . $mail->ErrorInfo;
    error_log($errorMessage);
    http_response_code(500);
    echo json_encode([
        'status' => 'error', 
        'message' => "Ошибка при отправке сообщения. Пожалуйста, попробуйте позже."
    ]);
}
?>