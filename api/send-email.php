<?php
// ✅ Исправлено: убраны пробелы в домене
header('Access-Control-Allow-Origin: https://xn----9sb8ajp.xn--p1ai');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Origin, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// ✅ Заголовки для безопасности (COOP + COEP)
// Используем `credentialless` вместо `require-corp`, чтобы не блокировать metrika_match.html
header('Cross-Origin-Embedder-Policy: credentialless');
header('Cross-Origin-Opener-Policy: same-origin');
header('Cross-Origin-Resource-Policy: same-site');

// ✅ Тип контента
header('Content-Type: application/json; charset=UTF-8');

// ⚠️ На проде: отключаем вывод ошибок
ini_set('display_errors', 0);
error_reporting(0);

// ✅ Логирование ошибок
define('LOG_FILE', __DIR__ . '/email_errors.log');

// ✅ Preflight-запрос (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ✅ Проверка метода
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
    exit;
}

// ✅ Проверка размера тела запроса
$inputData = file_get_contents('php://input');
if (strlen($inputData) > 10000) {
    http_response_code(413);
    echo json_encode([
        'status' => 'error',
        'message' => 'Payload too large'
    ]);
    exit;
}

// ✅ Проверка автозагрузки Composer
$autoload = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoload)) {
    error_log('FATAL: autoload.php not found', 3, LOG_FILE);
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Server error: Composer not installed'
    ]);
    exit;
}

require_once $autoload;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

try {
    // ✅ Загрузка .env
    $env = __DIR__ . '/.env';
    if (!file_exists($env)) throw new Exception('Файл .env не найден');
    if (!is_readable($env)) throw new Exception('Файл .env недоступен');

    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load();

    // ✅ Проверка обязательных переменных
    $required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CAPTCHA_SECRET'];
    foreach ($required as $key) {
        if (empty($_ENV[$key])) throw new Exception("Отсутствует: $key");
    }

    // ✅ Декодирование JSON
    $input = json_decode($inputData, true);
    if (!is_array($input)) throw new Exception('Invalid JSON');

    // ✅ Проверка токена капчи
    $token = $input['smartcaptcha_token'] ?? '';
    if (empty($token)) throw new Exception('Токен капчи не передан');

    // ✅ Валидация капчи
    $ch = curl_init();
    curl_setopt_array($ch, [
        // ✅ Исправлено: убраны пробелы в URL
        CURLOPT_URL => 'https://smartcaptcha.yandexcloud.net/validate',
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'secret' => $_ENV['CAPTCHA_SECRET'],
            'token' => $token,
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

    if ($curlError) throw new Exception("cURL error: $curlError");
    if ($httpCode !== 200) throw new Exception("Captcha error: $httpCode");

    $result = json_decode($response, true);
    if (!isset($result['status']) || $result['status'] !== 'ok') {
        throw new Exception('Капча не пройдена');
    }

    // ✅ Валидация полей формы
    $fields = ['name', 'email', 'phone', 'message'];
    foreach ($fields as $field) {
        if (empty($input[$field]) || !is_string($input[$field])) {
            throw new Exception("Поле '$field' обязательно");
        }
        $input[$field] = trim(strip_tags($input[$field]));
    }

    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Некорректный email');
    }

    // ✅ Отправка письма
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = $_ENV['SMTP_HOST'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $_ENV['SMTP_USER'];
    $mail->Password   = $_ENV['SMTP_PASS'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = (int)$_ENV['SMTP_PORT'];
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom($_ENV['SMTP_USER'], $_ENV['FROM_NAME'] ?? 'Форма обратной связи');
    $mail->addAddress($_ENV['TO_EMAIL']);
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

    // ✅ Успешный ответ
    echo json_encode([
        'status' => 'success',
        'message' => 'Сообщение отправлено'
    ]);

} catch (Exception $e) {
    // ✅ Логируем ошибку, но не показываем детали клиенту
    error_log("Email error: " . $e->getMessage(), 3, LOG_FILE);
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Ошибка сервера'
    ]);
}