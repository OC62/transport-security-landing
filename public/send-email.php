<?php
// send-email.php

// Настройка обработки ошибок
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-errors.log');

// Регистрируем shutdown function для перехвата фатальных ошибок
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Внутренняя ошибка сервера. Пожалуйста, попробуйте позже."
        ]);
        exit();
    }
});

// --- УЛУЧШЕННАЯ ЗАГРУЗКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ ---
 $env_path = __DIR__ . '/../.env';
$env = [];

if (file_exists($env_path)) {
    $env = parse_ini_file($env_path);
}

// --- НАСТРОЙКИ С ЗНАЧЕНИЯМИ ПО УМОЛЧАНИЮ ---
$smtp_host = $env['SMTP_HOST'] ?? 'smtp.gmail.com';
$smtp_port = $env['SMTP_PORT'] ?? 587;
$smtp_secure = $env['SMTP_SECURE'] ?? 'tls';
$smtp_username = $env['SMTP_USER'] ?? 'oc611164@gmail.com';
$smtp_password = $env['SMTP_PASS'] ?? 'bnwa lhco lnij xnzi';
$from_email = $env['FROM_EMAIL'] ?? 'oc611164@gmail.com';
$from_name = $env['FROM_NAME'] ?? 'Форма обратной связи ПТБ-М';
$to_email = $env['TO_EMAIL'] ?? 'oc611164@gmail.com';
$captcha_secret = $env['CAPTCHA_SECRET'];
$allowed_origin = $env['ALLOWED_ORIGIN'] ?? 'https://ПТБ-М.РФ';

// Устанавливаем заголовки для JSON-ответов
header("Access-Control-Allow-Origin: $allowed_origin");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
mb_internal_encoding('UTF-8');

// Функция для возврата JSON-ошибок
function returnJsonError($message, $code = 500) {
    http_response_code($code);
    echo json_encode(["success" => false, "message" => $message]);
    exit();
}

// Обработка OPTIONS-запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Проверка метода запроса
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    returnJsonError("Метод не разрешен", 405);
}

// Получение данных
$input = json_decode(file_get_contents("php://input"), true);
if (!$input) $input = $_POST;

// Проверка капчи
if (empty($input['smartcaptcha_token'])) {
    returnJsonError("Токен капчи отсутствует", 400);
}

$captcha_token = $input['smartcaptcha_token'];
$user_ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'];
$captcha_url = "https://smartcaptcha.yandexcloud.net/validate";

// ПОДГОТОВКА ДАННЫХ ДЛЯ POST-ЗАПРОСА
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

if (curl_errno($ch)) {
    error_log("CURL error: " . curl_error($ch));
    returnJsonError("Ошибка подключения к сервису капчи");
}

curl_close($ch);

// Анализ ответа
if ($http_code === 403) {
    // Детальный анализ 403 ошибки
    $response_data = json_decode($captcha_response, true);
    $error_detail = $response_data['message'] ?? 'Неизвестная ошибка 403';
    
    error_log("Yandex SmartCaptcha 403 Error: " . $error_detail);
    
    returnJsonError("Ошибка проверки капчи: $error_detail", 403);
}

if ($http_code !== 200) {
    returnJsonError("Сервер капчи вернул ошибку: HTTP $http_code", 500);
}

$captcha_data = json_decode($captcha_response, true);
if (!$captcha_data || $captcha_data['status'] !== 'ok') {
    $error_msg = $captcha_data['message'] ?? 'Неизвестная ошибка';
    returnJsonError("Ошибка капчи: $error_msg", 400);
}

// Проверка обязательных полей
$required_fields = ["name", "email", "phone", "message"];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        returnJsonError("Поле '$field' обязательно для заполнения", 400);
    }
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
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .message { border-left: 3px solid #4CAF50; padding: 10px 15px; margin: 15px 0; background: #f9f9f9; }
        .footer { color: #777; font-size: 0.9em; border-top: 1px solid #eee; padding-top: 10px; margin-top: 20px; }
    </style>
</head>
<body>
    <h2>Новое сообщение с сайта</h2>
    <p><strong>Имя:</strong> $name</p>
    <p><strong>Email:</strong> <a href='mailto:$email_from'>$email_from</a></p>
    <p><strong>Телефон:</strong> <a href='tel:$phone'>$phone</a></p>
    <p><strong>Сообщение:</strong></p>
    <div class='message'>$message_content</div>
    <div class='footer'>
        Отправлено: " . date('d.m.Y H:i') . " с IP: $user_ip
    </div>
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
    
    // Отправитель/получатель
    $mail->setFrom($from_email, $from_name);
    $mail->addAddress($to_email);
    $mail->addReplyTo($email_from, $name);
    
    // Контент
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body = $body;
    $mail->AltBody = strip_tags($body);
    
    // Отправка
    $mail->send();
    echo json_encode(["success" => true, "message" => "Сообщение успешно отправлено!"]);
} catch (Exception $e) {
    error_log("Ошибка отправки email: " . $e->getMessage());
    returnJsonError("Ошибка отправки: " . $e->getMessage(), 500);
}
?>