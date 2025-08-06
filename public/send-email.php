<?php
// send-email.php

// Включаем буферизацию вывода в самом начале
ob_start();

// Функция для возврата JSON-ошибок
function returnJsonError($message, $code = 500) {
    // Очищаем буфер перед отправкой ответа
    while (ob_get_level() > 0) ob_end_clean();
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(["success" => false, "message" => $message]);
    exit();
}

// Регистрируем shutdown function для перехвата фатальных ошибок
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        returnJsonError("Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.");
    }
});

// Настройка обработки ошибок
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-errors.log');

// Устанавливаем обработчик для всех ошибок
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error [$errno] in $errfile:$errline - $errstr");
    return true; // Продолжаем выполнение скрипта
});

// --- ЗАГРУЗКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ ---
$env_path = realpath(__DIR__ . '/../.env');
$env = [];

if (file_exists($env_path)) {
    $env = parse_ini_file($env_path);
} else {
    returnJsonError("Server configuration error: .env file not found", 500);
}

// --- НАСТРОЙКИ ---
$required_env_vars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL', 'TO_EMAIL', 'CAPTCHA_SECRET'];
foreach ($required_env_vars as $var) {
    if (empty($env[$var])) {
        returnJsonError("Server configuration error: Missing $var in .env", 500);
    }
}

$smtp_host = $env['SMTP_HOST'];
$smtp_port = $env['SMTP_PORT'] ?? 587;
$smtp_secure = $env['SMTP_SECURE'] ?? 'tls';
$smtp_username = $env['SMTP_USER'];
$smtp_password = $env['SMTP_PASS'];
$from_email = $env['FROM_EMAIL'];
$from_name = $env['FROM_NAME'] ?? 'Форма обратной связи';
$to_email = $env['TO_EMAIL'];
$captcha_secret = $env['CAPTCHA_SECRET'];
$allowed_origin = $env['ALLOWED_ORIGIN'] ?? '*';

// Устанавливаем заголовки
header("Access-Control-Allow-Origin: $allowed_origin");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
mb_internal_encoding('UTF-8');

// Обработка OPTIONS-запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Проверка метода запроса
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    returnJsonError("Метод не разрешен", 405);
}

// Получение и проверка входных данных
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || json_last_error() !== JSON_ERROR_NONE) {
    $input = $_POST;
}

// Проверка обязательных полей
$required_fields = ["name", "email", "phone", "message", "smartcaptcha_token"];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        returnJsonError("Поле '$field' обязательно для заполнения", 400);
    }
}

// Проверка капчи
$captcha_token = $input['smartcaptcha_token'];
$user_ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'];
$captcha_url = "https://smartcaptcha.yandexcloud.net/validate";

// Подготовка данных для POST-запроса
$captcha_data = [
    'secret' => $captcha_secret,
    'token' => $captcha_token,
    'ip' => $user_ip
];

// Используем cURL с POST-запросом
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $captcha_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($captcha_data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded',
    'User-Agent: PTB-M-Server/1.0'
]);

$captcha_response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

if ($curl_error) {
    error_log("CURL error: " . $curl_error);
    returnJsonError("Ошибка подключения к сервису капчи", 500);
}

if ($http_code !== 200) {
    error_log("Yandex API returned HTTP $http_code. Response: " . $captcha_response);
    returnJsonError("Ошибка проверки капчи: сервер вернул код $http_code", 500);
}

$captcha_data = json_decode($captcha_response, true);
if (!$captcha_data) {
    error_log("Invalid JSON response from Yandex: " . $captcha_response);
    returnJsonError("Неверный ответ от сервера капчи", 500);
}

if ($captcha_data['status'] !== 'ok') {
    $error_msg = $captcha_data['message'] ?? 'Неизвестная ошибка';
    returnJsonError("Ошибка капчи: $error_msg", 400);
}

// Санитизация данных
$name = htmlspecialchars(trim($input["name"]), ENT_QUOTES, 'UTF-8');
$email_from = filter_var(trim($input["email"]), FILTER_SANITIZE_EMAIL);
$phone = preg_replace('/[^\d+]/', '', trim($input["phone"]));
$message_content = htmlspecialchars(trim($input["message"]), ENT_QUOTES, 'UTF-8');

// Формирование письма
$subject = "Новое сообщение с сайта от $name";
$body = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>$subject</title>
</head>
<body>
    <h2>Новое сообщение с сайта</h2>
    <p><strong>Имя:</strong> $name</p>
    <p><strong>Email:</strong> <a href='mailto:$email_from'>$email_from</a></p>
    <p><strong>Телефон:</strong> <a href='tel:$phone'>$phone</a></p>
    <p><strong>Сообщение:</strong></p>
    <div style='border-left: 3px solid #4CAF50; padding: 0 0 0 10px; margin: 10px 0;'>
        " . nl2br($message_content) . "
    </div>
    <p style='color: #777; font-size: 0.9em; margin-top: 20px;'>
        Отправлено: " . date('d.m.Y H:i') . " с IP: $user_ip
    </p>
</body>
</html>
";

// Подключение PHPMailer
try {
    require_once __DIR__ . '/phpmailer/PHPMailer.php';
    require_once __DIR__ . '/phpmailer/SMTP.php';
    require_once __DIR__ . '/phpmailer/Exception.php';

    $mail = new PHPMailer\PHPMailer\PHPMailer(true);

    // SMTP Настройки
    $mail->isSMTP();
    $mail->Host = $smtp_host;
    $mail->SMTPAuth = true;
    $mail->Username = $smtp_username;
    $mail->Password = $smtp_password;
    $mail->SMTPSecure = $smtp_secure;
    $mail->Port = $smtp_port;
    $mail->CharSet = 'UTF-8';
    
    // Настройки SSL для локального тестирования
    $mail->SMTPOptions = [
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ];
    
    // Отправитель/получатель
    $mail->setFrom($from_email, $from_name);
    $mail->addAddress($to_email);
    $mail->addReplyTo($email_from, $name);
    
    // Контент
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body = $body;
    $mail->AltBody = strip_tags(str_replace('<br />', "\n", $body));
    
    // Отправка
    $mail->send();
    
    // Очищаем буфер перед отправкой JSON
    while (ob_get_level() > 0) ob_end_clean();
    echo json_encode(["success" => true, "message" => "Сообщение успешно отправлено!"]);
} catch (Exception $e) {
    returnJsonError("Ошибка отправки: " . $e->getMessage(), 500);
}

// Завершаем буферизацию
ob_end_flush();
?>