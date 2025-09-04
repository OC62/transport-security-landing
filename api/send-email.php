<?php
// api/send-email.php

// Создаем директорию для логов, если её нет
$logDir = __DIR__ . '/logs';
if (!file_exists($logDir)) {
    mkdir($logDir, 0755, true);
}

// Функция для записи в лог-файл
function logMessage($message, $level = 'INFO') {
    $logFile = __DIR__ . '/logs/captcha_debug.log';
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    
    // Форматируем сообщение
    $formattedMessage = "[$timestamp] [$level] [IP: $ip] $message\n";
    
    // Записываем в файл
    file_put_contents($logFile, $formattedMessage, FILE_APPEND);
    
    // Также выводим в error_log для дополнительной надежности
    error_log($formattedMessage);
}

// Начинаем логирование
logMessage("===== НОВЫЙ ЗАПРОС НА ОТПРАВКУ ФОРМЫ =====", "START");
logMessage("User-Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'n/a'));
logMessage("Remote IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'n/a'));
logMessage("Request method: " . $_SERVER['REQUEST_METHOD']);

// Подключаем .env вручную
$dotenvPath = __DIR__ . '/.env';
logMessage("Попытка загрузить .env из: $dotenvPath");
if (file_exists($dotenvPath)) {
    logMessage(".env файл найден, начинаем обработку");
    $lines = file($dotenvPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && $line[0] !== '#') {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            $value = trim($value, "\"'");
            $_ENV[$name] = $value;
            logMessage("Загружена переменная: $name = " . (strpos($name, 'PASS') !== false ? '***MASKED***' : $value));
        }
    }
} else {
    logMessage(".env файл НЕ найден!", "ERROR");
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Исправлен домен: без пробелов
logMessage("Устанавливаем CORS заголовки");
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://xn----9sb8ajp.xn--p1ai');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400');
header("Cross-Origin-Embedder-Policy: credentialless");
header("Cross-Origin-Opener-Policy: same-origin");

// Обработка pre-flight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    logMessage("Обработка pre-flight запроса OPTIONS");
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $errorMsg = "Метод не разрешён: " . $_SERVER['REQUEST_METHOD'];
    logMessage($errorMsg, "ERROR");
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => $errorMsg]);
    exit;
}

logMessage("Загружаем PHPMailer библиотеки");
require_once __DIR__ . '/phpmailer/PHPMailer.php';
require_once __DIR__ . '/phpmailer/SMTP.php';
require_once __DIR__ . '/phpmailer/Exception.php';

logMessage("Получаем данные из тела запроса");
$data = json_decode(file_get_contents('php://input'), true);

if (json_last_error() !== JSON_ERROR_NONE) {
    $jsonError = json_last_error_msg();
    $inputData = file_get_contents('php://input');
    logMessage("Ошибка JSON: $jsonError. Данные: $inputData", "ERROR");
    
    // Добавляем отладочную информацию в ответ (временно для диагностики)
    $response = [
        'status' => 'error',
        'message' => 'Некорректные данные формы',
        'debug' => [
            'json_error' => $jsonError,
            'raw_data' => substr($inputData, 0, 200) . (strlen($inputData) > 200 ? '...' : '')
        ]
    ];
    
    header('X-Captcha-Debug: json_error');
    http_response_code(400);
    echo json_encode($response);
    exit;
}

if (!$data) {
    logMessage("Данные формы пусты", "ERROR");
    $response = [
        'status' => 'error',
        'message' => 'Пустые данные формы',
        'debug' => ['data' => $data]
    ];
    
    header('X-Captcha-Debug: empty_data');
    http_response_code(400);
    echo json_encode($response);
    exit;
}

// Проверка обязательных полей
$requiredFields = ['name', 'email', 'phone', 'message', 'smartcaptcha_token'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        $errorMsg = "Отсутствует обязательное поле: $field";
        logMessage($errorMsg, "ERROR");
        
        $response = [
            'status' => 'error',
            'message' => $errorMsg,
            'debug' => [
                'missing_field' => $field,
                'provided_fields' => array_keys($data)
            ]
        ];
        
        header('X-Captcha-Debug: missing_field');
        http_response_code(400);
        echo json_encode($response);
        exit;
    }
}

logMessage("Валидация email: " . $data['email']);
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $errorMsg = "Некорректный email: " . $data['email'];
    logMessage($errorMsg, "ERROR");
    
    $response = [
        'status' => 'error',
        'message' => $errorMsg,
        'debug' => ['email' => $data['email']]
    ];
    
    header('X-Captcha-Debug: invalid_email');
    http_response_code(400);
    echo json_encode($response);
    exit;
}

// Проверка капчи - начинаем детальное логирование
logMessage("===== НАЧАЛО ПРОВЕРКИ КАПЧИ =====", "CAPTCHA");
$captchaToken = $data['smartcaptcha_token'] ?? '';
logMessage("Получен токен капчи: " . (strlen($captchaToken) > 20 ? substr($captchaToken, 0, 20) . '...' : $captchaToken));

// Проверяем секретный ключ
$secretKey = $_ENV['CAPTCHA_SECRET'] ?? '';
if (empty($secretKey)) {
    logMessage('CAPTCHA_SECRET не настроен', "ERROR");
    $response = [
        'status' => 'error',
        'message' => 'Ошибка сервера: CAPTCHA_SECRET не настроен',
        'debug' => ['env_keys' => array_keys($_ENV)]
    ];
    
    header('X-Captcha-Debug: secret_not_configured');
    http_response_code(500);
    echo json_encode($response);
    exit;
} else {
    logMessage("CAPTCHA_SECRET найден (длина: " . strlen($secretKey) . ")", "CAPTCHA");
}

// Получение IP-адреса с детальным логированием
function getUserIp() {
    $ipSources = [
        'HTTP_CLIENT_IP' => $_SERVER['HTTP_CLIENT_IP'] ?? null,
        'HTTP_X_FORWARDED_FOR' => $_SERVER['HTTP_X_FORWARDED_FOR'] ?? null,
        'REMOTE_ADDR' => $_SERVER['REMOTE_ADDR'] ?? null
    ];
    
    logMessage("Источники IP: " . json_encode($ipSources), "CAPTCHA");
    
    $ip = '';
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
        logMessage("Используем IP из HTTP_CLIENT_IP: $ip", "CAPTCHA");
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ipList = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $ip = trim($ipList[0]);
        logMessage("Используем IP из HTTP_X_FORWARDED_FOR: $ip (из списка: " . $_SERVER['HTTP_X_FORWARDED_FOR'] . ")", "CAPTCHA");
    } else {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        logMessage("Используем REMOTE_ADDR: $ip", "CAPTCHA");
    }
    
    return $ip;
}

$ip = getUserIp();
logMessage("Определен IP пользователя для капчи: $ip", "CAPTCHA");

// Используем ПРАВИЛЬНЫЙ URL для проверки капчи
$url = "https://captcha-api.yandex.ru/validate?secret=" . urlencode($secretKey) .
       "&token=" . urlencode($captchaToken) .
       "&ip=" . urlencode($ip);

logMessage("Формируем URL для проверки капчи: $url", "CAPTCHA");
logMessage("Секретный ключ (первые 10 символов): " . substr($secretKey, 0, 10) . "...", "CAPTCHA");
logMessage("Токен капчи (первые 20 символов): " . substr($captchaToken, 0, 20) . "...", "CAPTCHA");
logMessage("IP пользователя: $ip", "CAPTCHA");

// Проверяем доступность API Яндекса
logMessage("Проверяем доступность API Яндекс.Капчи...");
$apiCheck = @fsockopen('captcha-api.yandex.ru', 443, $errno, $errstr, 5);
if ($apiCheck) {
    logMessage("API Яндекс.Капчи доступно", "CAPTCHA");
    fclose($apiCheck);
} else {
    $errorMsg = "API Яндекс.Капчи недоступно: [$errno] $errstr";
    logMessage($errorMsg, "ERROR");
}

// Добавляем подробное логирование cURL (более надежно, чем file_get_contents)
logMessage("Инициализируем cURL для запроса к API", "CAPTCHA");
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_VERBOSE, true);

// Создаем временный файл для логов cURL
$verboseLog = fopen(__DIR__ . '/logs/curl_verbose.log', 'w+');
curl_setopt($ch, CURLOPT_STDERR, $verboseLog);

// Выполняем запрос
logMessage("Отправляем запрос к API Яндекс.Капчи...", "CAPTCHA");
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
$curlErrno = curl_errno($ch);

// Закрываем и сохраняем логи cURL
fclose($verboseLog);
$verboseLogContent = file_get_contents(__DIR__ . '/logs/curl_verbose.log');
logMessage("Логи cURL сохранены", "CAPTCHA");

// Логируем результат запроса
logMessage("HTTP статус от API: $httpCode", "CAPTCHA");
logMessage("cURL ошибка (код: $curlErrno): $curlError", "CAPTCHA");
logMessage("Полный ответ от API: $response", "CAPTCHA");
logMessage("Логи cURL:\n$verboseLogContent", "CAPTCHA");

// Проверяем, действительно ли это JSON
$jsonError = null;
$captchaResult = json_decode($response, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    $jsonError = json_last_error_msg();
    logMessage("Ошибка декодирования JSON: $jsonError", "ERROR");
    logMessage("Сырой ответ от API: $response", "CAPTCHA");
}

// Детальная диагностика ответа
if ($httpCode !== 200) {
    $errorMessage = "API вернул ошибку HTTP $httpCode";
    logMessage($errorMessage, "ERROR");
    
    $debugInfo = [
        'http_code' => $httpCode,
        'curl_error' => $curlError,
        'curl_errno' => $curlErrno,
        'response' => $response,
        'json_error' => $jsonError,
        'url' => $url,
        'ip' => $ip,
        'token_preview' => substr($captchaToken, 0, 20) . '...',
        'secret_preview' => substr($secretKey, 0, 10) . '...'
    ];
    
    logMessage("Детали ошибки API: " . json_encode($debugInfo), "ERROR");
    
    $response = [
        'status' => 'error',
        'message' => 'Ошибка при проверке капчи',
        'debug' => $debugInfo
    ];
    
    header('X-Captcha-Debug: api_http_error');
    http_response_code(500);
    echo json_encode($response);
    exit;
}

// Проверяем структуру ответа
if ($captchaResult === null) {
    $errorMessage = "Не удалось распарсить ответ API";
    logMessage($errorMessage, "ERROR");
    
    $debugInfo = [
        'response' => $response,
        'json_error' => $jsonError,
        'http_code' => $httpCode
    ];
    
    logMessage("Детали ошибки парсинга: " . json_encode($debugInfo), "ERROR");
    
    $response = [
        'status' => 'error',
        'message' => 'Внутренняя ошибка сервера',
        'debug' => $debugInfo
    ];
    
    header('X-Captcha-Debug: json_parse_error');
    http_response_code(500);
    echo json_encode($response);
    exit;
}

// Детальная проверка ответа от API
logMessage("Получен ответ от API: " . json_encode($captchaResult), "CAPTCHA");

if (isset($captchaResult['status']) && $captchaResult['status'] === 'error') {
    $errorMessage = "Ошибка капчи: " . ($captchaResult['message'] ?? 'unknown');
    logMessage($errorMessage, "ERROR");
    
    $debugInfo = [
        'captcha_response' => $captchaResult,
        'url' => $url,
        'http_code' => $httpCode,
        'token_preview' => substr($captchaToken, 0, 20) . '...',
        'secret_preview' => substr($secretKey, 0, 10) . '...',
        'ip' => $ip
    ];
    
    logMessage("Детали ошибки капчи: " . json_encode($debugInfo), "ERROR");
    
    // Добавляем информацию об ошибке в ответ для диагностики
    $response = [
        'status' => 'error',
        'message' => 'Неверная капча. Пожалуйста, пройдите проверку заново.',
        'captcha_error' => $captchaResult['message'] ?? 'unknown',
        'debug' => $debugInfo
    ];
    
    header('X-Captcha-Debug: captcha_validation_error');
    http_response_code(400);
    echo json_encode($response);
    exit;
}

// Проверяем успешный ответ
if (!isset($captchaResult['success']) || $captchaResult['success'] !== true) {
    $errorMessage = "Капча не пройдена. Ответ API: " . json_encode($captchaResult);
    logMessage($errorMessage, "ERROR");
    
    $debugInfo = [
        'captcha_response' => $captchaResult,
        'url' => $url,
        'http_code' => $httpCode,
        'token_preview' => substr($captchaToken, 0, 20) . '...',
        'secret_preview' => substr($secretKey, 0, 10) . '...',
        'ip' => $ip
    ];
    
    logMessage("Детали ошибки валидации: " . json_encode($debugInfo), "ERROR");
    
    $response = [
        'status' => 'error',
        'message' => 'Неверная капча. Пожалуйста, пройдите проверку заново.',
        'debug' => $debugInfo
    ];
    
    header('X-Captcha-Debug: captcha_failed');
    http_response_code(400);
    echo json_encode($response);
    exit;
}

logMessage("Капча успешно пройдена!", "SUCCESS");

try {
    $mail = new PHPMailer(true);
    logMessage("Инициализация PHPMailer");

    $mail->isSMTP();
    $mail->Host       = $_ENV['SMTP_HOST'] ?? 'smtp.gmail.com';
    $mail->Port       = (int)($_ENV['SMTP_PORT'] ?? 587);
    $mail->SMTPAuth   = true;
    $mail->Username   = $_ENV['SMTP_USER'];
    $mail->Password   = $_ENV['SMTP_PASS'];
    
    // Правильная обработка SMTPSecure
    if (($_ENV['SMTP_SECURE'] ?? 'tls') === 'tls') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        logMessage("Используем шифрование: STARTTLS");
    } elseif (($_ENV['SMTP_SECURE'] ?? 'tls') === 'ssl') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        logMessage("Используем шифрование: SSL");
    } else {
        $mail->SMTPSecure = false;
        logMessage("Шифрование не используется");
    }
    
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

    logMessage("Отправка email на $toEmail...");
    $mail->send();
    logMessage("Письмо успешно отправлено!", "SUCCESS");
    
    $response = [
        'status' => 'success',
        'message' => 'Письмо отправлено',
        'debug' => [
            'to' => $toEmail,
            'from' => $_ENV['SMTP_USER'],
            'subject' => 'Новая заявка с сайта ПТБ-М.РФ'
        ]
    ];
    
    header('X-Captcha-Debug: success');
    echo json_encode($response);
} catch (Exception $e) {
    $errorMessage = 'PHPMailer Error: ' . $e->getMessage();
    logMessage($errorMessage, "ERROR");
    
    $response = [
        'status' => 'error',
        'message' => 'Ошибка отправки: ' . $mail->ErrorInfo,
        'debug' => [
            'error' => $e->getMessage(),
            'smtp_host' => $_ENV['SMTP_HOST'] ?? 'n/a',
            'smtp_port' => $_ENV['SMTP_PORT'] ?? 'n/a'
        ]
    ];
    
    header('X-Captcha-Debug: mail_error');
    http_response_code(500);
    echo json_encode($response);
}

logMessage("===== ЗАВЕРШЕНИЕ ОБРАБОТКИ ЗАПРОСА =====", "END");