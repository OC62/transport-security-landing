<?php
// send-email.php
// Обработчик формы обратной связи с Яндекс СмартКапчей и SMTP через PHPMailer
// Безопасная версия — с включённой проверкой SSL

// Отключаем вывод ошибок на экран, но логируем
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-errors.log');

// Перехват фатальных ошибок (E_ERROR, E_PARSE и т.д.)
register_shutdown_function(function () {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        header('Content-Type: application/json; charset=UTF-8');
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Внутренняя ошибка сервера. Пожалуйста, попробуйте позже."
        ]);
        exit();
    }
});

// --- ФУНКЦИЯ ДЛЯ ОТВЕТА С ОШИБКОЙ ---
function returnJsonError($message, $code = 500) {
    http_response_code($code);
    echo json_encode([
        "success" => false,
        "message" => $message
    ]);
    exit();
}

// --- ЗАГРУЗКА .ENV ---
$env_path = realpath(__DIR__ . '/../.env');
$env = [];

if (file_exists($env_path)) {
    $env = parse_ini_file($env_path);
} else {
    error_log("ERROR: .env file not found at: $env_path");
    returnJsonError("Ошибка конфигурации сервера", 500);
}

// --- НАСТРОЙКИ ---
$smtp_host = $env['SMTP_HOST'] ?? 'smtp.gmail.com';
$smtp_port = (int)($env['SMTP_PORT'] ?? 587);
$smtp_secure = $env['SMTP_SECURE'] ?? 'tls'; // 'tls' или 'ssl'
$smtp_username = $env['SMTP_USER'] ?? 'oc611164@gmail.com';
$smtp_password = $env['SMTP_PASS'] ?? 'bnwa lhco lnij xnzi';
$from_email = $env['FROM_EMAIL'] ?? 'oc611164@gmail.com';
$from_name = $env['FROM_NAME'] ?? 'Форма обратной связи ПТБ-М';
$to_email = $env['TO_EMAIL'] ?? 'oc611164@gmail.com';
$captcha_secret = $env['CAPTCHA_SECRET'] ?? null;

// Для CORS — используем Punycode (без кириллицы)
$allowed_origin = $env['ALLOWED_ORIGIN'] ?? 'https://xn----9sb8ajp.xn--p1ai'; // ПТБ-М.РФ

// --- ПРОВЕРКА ОБЯЗАТЕЛЬНЫХ ПАРАМЕТРОВ ---
if (empty($captcha_secret)) {
    error_log("ERROR: CAPTCHA_SECRET is missing");
    returnJsonError("Ошибка сервера: отсутствует ключ капчи", 500);
}

// --- ЗАГОЛОВКИ ---
header("Access-Control-Allow-Origin: $allowed_origin");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
mb_internal_encoding('UTF-8');

// --- PREFLIGHT (OPTIONS) ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- ПРОВЕРКА МЕТОДА ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    returnJsonError("Метод не разрешён", 405);
}

// --- ПОЛУЧЕНИЕ ДАННЫХ ---
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

// --- ПРОВЕРКА КАПЧИ ---
if (empty($input['smartcaptcha_token'])) {
    returnJsonError("Токен капчи отсутствует", 400);
}

$captcha_token = trim($input['smartcaptcha_token']);
$user_ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'];
$captcha_url = 'https://smartcaptcha.yandexcloud.net/validate';

$captcha_data = [
    'secret' => $captcha_secret,
    'token' => $captcha_token,
    'ip' => $user_ip
];

// --- ЗАПРОС К ЯНДЕКС КАПЧЕ ---
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $captcha_url,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query($captcha_data),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/x-www-form-urlencoded',
        'User-Agent: PTB-M-Secure/1.0'
    ]
]);

$captcha_response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

if ($curl_error) {
    error_log("CURL error: " . $curl_error);
    returnJsonError("Ошибка подключения к капче", 500);
}

if ($http_code !== 200) {
    error_log("Captcha API error $http_code: $captcha_response");
    returnJsonError("Ошибка проверки капчи", 500);
}

$captcha_data = json_decode($captcha_response, true);
if (!$captcha_data || ($captcha_data['status'] ?? '') !== 'ok') {
    $msg = $captcha_data['message'] ?? 'Неверный токен';
    returnJsonError("Ошибка капчи: $msg", 400);
}

// --- ПРОВЕРКА ПОЛЕЙ ФОРМЫ ---
$required = ['name', 'email', 'phone', 'message'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        returnJsonError("Поле '$field' обязательно", 400);
    }
}

// --- САНИТАЦИЯ ---
$name = htmlspecialchars(trim($input['name']), ENT_QUOTES, 'UTF-8');
$email_from = filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL);
$phone = preg_replace('/[^\d+]/', '', trim($input['phone']));
$message_content = htmlspecialchars(trim($input['message']), ENT_QUOTES, 'UTF-8');

if (!$email_from) {
    returnJsonError("Некорректный email", 400);
}

// --- ФОРМИРОВАНИЕ ПИСЬМА ---
$subject = "Сообщение с сайта от $name";
$body = "
<!DOCTYPE html>
<html>
<head><meta charset='UTF-8'></head>
<body style='font-family:Arial,sans-serif;line-height:1.6;color:#333;'>
    <h2>Новое сообщение</h2>
    <p><strong>Имя:</strong> $name</p>
    <p><strong>Email:</strong> <a href='mailto:$email_from'>$email_from</a></p>
    <p><strong>Телефон:</strong> <a href='tel:+$phone'>$phone</a></p>
    <p><strong>Сообщение:</strong></p>
    <div style='border-left:3px solid #4CAF50;padding:10px;background:#f9f9f9;'>$message_content</div>
    <div style='color:#777;font-size:0.9em;border-top:1px solid #eee;padding-top:10px;margin-top:20px;'>
        Отправлено: " . date('d.m.Y H:i') . " | IP: $user_ip
    </div>
</body>
</html>
";

// --- ОТПРАВКА ЧЕРЕЗ PHPMailer ---
try {
    require_once __DIR__ . '/phpmailer/PHPMailer.php';
    require_once __DIR__ . '/phpmailer/SMTP.php';
    require_once __DIR__ . '/phpmailer/Exception.php';

    $mail = new PHPMailer\PHPMailer\PHPMailer(true);

    // Настройки SMTP (без отключения SSL!)
    $mail->isSMTP();
    $mail->Host       = $smtp_host;
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtp_username;
    $mail->Password   = $smtp_password;
    $mail->SMTPSecure = $smtp_secure; // 'tls' (587) или 'ssl' (465)
    $mail->Port       = $smtp_port;
    $mail->CharSet    = 'UTF-8';

    // ✅ SSL-проверка ВКЛЮЧЕНА — безопасно!
    // Не используем SMTPOptions — PHPMailer сам проверит сертификат

    // Отправитель и получатель
    $mail->setFrom($from_email, $from_name);
    $mail->addAddress($to_email);
    $mail->addReplyTo($email_from, $name);

    // Контент
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body    = $body;
    $mail->AltBody = strip_tags($message_content);

    // Отправка
    $mail->send();
    echo json_encode([
        "success" => true,
        "message" => "Сообщение отправлено!"
    ]);

} catch (Exception $e) {
    error_log("Email send error: " . $e->getMessage());
    returnJsonError("Ошибка отправки письма. Попробуйте позже.", 500);
}