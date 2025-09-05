<?php
header('Access-Control-Allow-Origin: https://xn----9sb8ajp.xn--p1ai');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Включение отображения ошибок для диагностики
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Обработка preflight запросов
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Проверка доступности vendor/autoload.php
$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Server configuration error: Autoload not found'
    ]);
    exit;
}

try {
    require_once $autoloadPath;
    
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;
    use Dotenv\Dotenv;

    // Загрузка переменных окружения
    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load();

    // Получение данных из переменных окружения
    $SMTP_HOST = $_ENV['SMTP_HOST'] ?? getenv('SMTP_HOST');
    $SMTP_PORT = $_ENV['SMTP_PORT'] ?? getenv('SMTP_PORT');
    $SMTP_USER = $_ENV['SMTP_USER'] ?? getenv('SMTP_USER');
    $SMTP_PASS = $_ENV['SMTP_PASS'] ?? getenv('SMTP_PASS');
    $FROM_NAME = $_ENV['FROM_NAME'] ?? getenv('FROM_NAME');
    $TO_EMAIL = $_ENV['TO_EMAIL'] ?? getenv('TO_EMAIL');
    $CAPTCHA_SECRET = $_ENV['CAPTCHA_SECRET'] ?? getenv('CAPTCHA_SECRET');

    // Проверка наличия обязательных переменных
    $requiredEnvVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'CAPTCHA_SECRET'];
    foreach ($requiredEnvVars as $var) {
        if (empty($$var)) {
            throw new Exception("Missing required environment variable: $var");
        }
    }

    // Получение данных из запроса
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        throw new Exception('Invalid JSON input');
    }

    // Валидация капчи
    $captcha_token = $input['smartcaptcha_token'] ?? '';
    if (empty($captcha_token)) {
        throw new Exception('Captcha token is required');
    }

    $captcha_url = "https://smartcaptcha.yandexcloud.net/validate?secret=$CAPTCHA_SECRET&token=$captcha_token&ip=".$_SERVER['REMOTE_ADDR'];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $captcha_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
    $captcha_response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http_code !== 200) {
        throw new Exception("Captcha service error: HTTP code $http_code");
    }

    $captcha_data = json_decode($captcha_response, true);

    if (!$captcha_data || $captcha_data['status'] !== 'ok') {
        throw new Exception('Captcha validation failed');
    }

    // Валидация обязательных полей
    $required_fields = ['name', 'email', 'phone', 'message'];
    foreach ($required_fields as $field) {
        if (empty($input[$field])) {
            throw new Exception("Field $field is required");
        }
    }

    // Отправка письма
    $mail = new PHPMailer(true);

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
    http_response_code(500);
    echo json_encode([
        'status' => 'error', 
        'message' => 'Ошибка сервера: ' . $e->getMessage()
    ]);
    
    // Логирование ошибки
    error_log("Send-email error: " . $e->getMessage());
}