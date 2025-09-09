<?php
// send-email.php — безопасный обработчик формы

// ✅ Исправленный CORS (без пробелов!)
header('Access-Control-Allow-Origin: https://xn----9sb8ajp.xn--p1ai');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');

// 🔽 Отключаем вывод ошибок
ini_set('display_errors', 0);
error_reporting(0);

// Лог-файл
define('LOG_FILE', __DIR__ . '/email_errors.log');

// Проверка расширений
$requiredExtensions = ['curl', 'openssl', 'json'];
foreach ($requiredExtensions as $ext) {
    if (!extension_loaded($ext)) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Расширение ' . $ext . ' не загружено'
        ]);
        exit;
    }
}

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Только POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Метод не разрешён']);
    exit;
}

// Проверка размера
$inputData = file_get_contents('php://input');
if (strlen($inputData) > 10000) {
    http_response_code(413);
    echo json_encode(['status' => 'error', 'message' => 'Слишком большой объем данных']);
    exit;
}

// Путь к автозагрузчику
$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    $autoloadPath = __DIR__ . '/../vendor/autoload.php';
}

if (!file_exists($autoloadPath)) {
    error_log('FATAL: autoload.php not found', 3, LOG_FILE);
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Выполните composer install'
    ]);
    exit;
}

require_once $autoloadPath;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

try {
    // Проверка .env
    $envPath = __DIR__ . '/.env';
    if (!is_readable($envPath)) {
        throw new Exception('Файл .env недоступен');
    }

    // Загружаем переменные
    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load();

    // Переменные из .env
    $SMTP_HOST = $_ENV['SMTP_HOST'] ?? getenv('SMTP_HOST');
    $SMTP_PORT = (int)($_ENV['SMTP_PORT'] ?? getenv('SMTP_PORT'));
    $SMTP_USER = $_ENV['SMTP_USER'] ?? getenv('SMTP_USER');
    $SMTP_PASS = $_ENV['SMTP_PASS'] ?? getenv('SMTP_PASS');
    $FROM_NAME = $_ENV['FROM_NAME'] ?? 'Сайт ПТБ-М';
    $TO_EMAIL = $_ENV['TO_EMAIL'] ?? $SMTP_USER;
    $CAPTCHA_SECRET = $_ENV['CAPTCHA_SECRET'] ?? getenv('CAPTCHA_SECRET');

    // Проверка обязательных переменных
    $requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CAPTCHA_SECRET'];
    foreach ($requiredEnv as $key) {
        if (empty($$key)) {
            throw new Exception("Отсутствует: $key");
        }
    }

    // Данные
    $input = json_decode($inputData, true);
    if (!is_array($input)) {
        throw new Exception('Ожидается JSON');
    }

    // Капча
    $captchaToken = $input['smartcaptcha_token'] ?? '';
    if (empty($captchaToken)) {
        throw new Exception('Токен капчи не передан');
    }

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => 'https://smartcaptcha.yandexcloud.net/validate',
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'secret' => $CAPTCHA_SECRET,
            'token' => $captchaToken,
            'ip' => $_SERVER['REMOTE_ADDR']
        ]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        throw new Exception("Ошибка cURL: $curlError");
    }

    if ($httpCode !== 200) {
        throw new Exception("Ошибка капчи: $httpCode");
    }

    $result = json_decode($response, true);
    if (!isset($result['status']) || $result['status'] !== 'ok') {
        throw new Exception('Проверка капчи не пройдена');
    }

    // Валидация формы
    $requiredFields = ['name', 'email', 'phone', 'message'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field]) || !is_string($input[$field])) {
            throw new Exception("Поле '$field' обязательно");
        }
        $input[$field] = trim(strip_tags($input[$field]));
    }

    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Некорректный email');
    }

    // Отправка
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = $SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = $SMTP_USER;
    $mail->Password   = $SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = $SMTP_PORT;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom($SMTP_USER, $FROM_NAME);
    $mail->addAddress($TO_EMAIL);
    $mail->addReplyTo($input['email'], $input['name']);

    $mail->isHTML(true);
    $mail->Subject = '📩 Новое сообщение с сайта ПТБ-М';
    $mail->Body = "
        <h2>📬 Новое сообщение</h2>
        <p><strong>Имя:</strong> " . htmlspecialchars($input['name']) . "</p>
        <p><strong>Email:</strong> " . htmlspecialchars($input['email']) . "</p>
        <p><strong>Телефон:</strong> " . htmlspecialchars($input['phone']) . "</p>
        <p><strong>Сообщение:</strong><br>" . nl2br(htmlspecialchars($input['message'])) . "</p>
        <hr>
        <p><small><strong>IP:</strong> {$_SERVER['REMOTE_ADDR']}</small></p>
        <p><small><strong>Время:</strong> " . date('d.m.Y H:i:s') . "</small></p>
    ";

    $mail->send();

    // Успех
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Сообщение отправлено'
    ]);

} catch (Exception $e) {
    error_log("Email error: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine(), 3, LOG_FILE);
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Ошибка сервера. Пожалуйста, попробуйте позже.'
    ]);
}