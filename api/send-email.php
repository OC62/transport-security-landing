<?php
// Убедитесь, что НИЧЕГО нет перед этим (никаких пробелов, BOM, вывода)

// Разрешение CORS
header('Access-Control-Allow-Origin: https://xn----9sb8ajp.xn--p1ai');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Включаем отображение ошибок (только для разработки!)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Обработка preflight-запросов (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Проверка метода запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Метод не разрешён']);
    exit;
}

// Путь к autoload.php
$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Ошибка сервера: автозагрузчик Composer не найден. Убедитесь, что вы выполнили "composer install".'
    ]);
    exit;
}

// Подключаем Composer
require_once $autoloadPath;

// Импортируем классы (должны быть сразу после require, без вывода)
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

try {
    // Загружаем переменные окружения
    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load();

    // Получаем переменные из .env
    $SMTP_HOST = $_ENV['SMTP_HOST'] ?? getenv('SMTP_HOST');
    $SMTP_PORT = (int)($_ENV['SMTP_PORT'] ?? getenv('SMTP_PORT'));
    $SMTP_USER = $_ENV['SMTP_USER'] ?? getenv('SMTP_USER');
    $SMTP_PASS = $_ENV['SMTP_PASS'] ?? getenv('SMTP_PASS');
    $FROM_NAME = $_ENV['FROM_NAME'] ?? 'Сайт ПТБ-М';
    $TO_EMAIL = $_ENV['TO_EMAIL'] ?? $_ENV['SMTP_USER'];
    $CAPTCHA_SECRET = $_ENV['CAPTCHA_SECRET'] ?? getenv('CAPTCHA_SECRET');

    // Проверка обязательных переменных
    $requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CAPTCHA_SECRET'];
    foreach ($requiredEnv as $key) {
        if (empty($$key)) {
            throw new Exception("Отсутствует обязательная переменная окружения: $key");
        }
    }

    // Получаем тело запроса
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        throw new Exception('Неверные данные: ожидается JSON');
    }

    // Проверка капчи (Яндекс SmartCaptcha)
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
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception("Ошибка капчи: HTTP $httpCode");
    }

    $result = json_decode($response, true);
    if (!isset($result['status']) || $result['status'] !== 'ok') {
        throw new Exception('Проверка капчи не пройдена');
    }

    // Валидация полей формы
    $requiredFields = ['name', 'email', 'phone', 'message'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field]) || !is_string($input[$field])) {
            throw new Exception("Поле '$field' обязательно для заполнения");
        }
        $input[$field] = trim(strip_tags($input[$field]));
    }

    // Проверка email
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Некорректный email');
    }

    // Отправка письма через PHPMailer
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

    // Успешный ответ
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Сообщение успешно отправлено'
    ]);

} catch (Exception $e) {
    error_log("Ошибка отправки письма: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Ошибка сервера. Пожалуйста, попробуйте позже.'
        // В продакшене НЕ отправляйте $e->getMessage() клиенту
    ]);
}