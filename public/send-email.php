<?php
// send-email.php

// --- НАСТРОЙКИ ---

$smtp_host = 'smtp.gmail.com'; // Хост SMTP-сервера
$smtp_port = 587;              // Порт SMTP-сервера (587 для TLS, 465 для SSL)
$smtp_secure = 'tls';          // Протокол шифрования ('tls' или 'ssl')
$smtp_username = 'oc611164@gmail.com'; // Логин SMTP (ваш email)
$smtp_password = 'bnwa lhco lnij xnzi'; // ПАРОЛЬ ПРИЛОЖЕНИЯ от Gmail (не обычный пароль!)
$from_email = 'oc611164@gmail.com';    // Email, от которого будет отправлено письмо
$from_name = 'Форма обратной связи ПТБ-М'; // Имя отправителя
$to_email = 'oc611164@gmail.com';       // Email, на который придут сообщения с формы
// --- КОНЕЦ НАСТРОЕК ---

// Разрешаем CORS для запросов с вашего сайта
header("Access-Control-Allow-Origin: https://ПТБ-М.РФ");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
mb_internal_encoding('UTF-8');

// Обрабатываем preflight OPTIONS-запросы (от браузеров)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Проверяем, что запрос пришёл методом POST
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["success" => false, "message" => "Метод не разрешен"]);
    exit();
}

// Получаем данные из тела запроса (для JSON)
$input = json_decode(file_get_contents("php://input"), true);

// Если данные не в JSON, пробуем получить из $_POST (для form-data)
if (!$input) {
    $input = $_POST;
}

// Проверяем обязательные поля
if (
    empty($input["name"]) ||
    empty($input["email"]) ||
    empty($input["phone"]) ||
    empty($input["message"])
) {
    http_response_code(400); // Bad Request
    echo json_encode(["success" => false, "message" => "Все поля обязательны для заполнения."]);
    exit();
}

// Санитизация данных (защита от XSS)
$name = mb_convert_encoding(trim($input["name"]), 'UTF-8', 'UTF-8');
$email_from = filter_var(trim($input["email"]), FILTER_SANITIZE_EMAIL);
$phone = preg_replace('/[^0-9+]/', '', trim($input["phone"]));
$message_content = mb_convert_encoding(trim($input["message"]), 'UTF-8', 'UTF-8');

// Формируем тело письма в HTML
$subject = "Новое сообщение с сайта от " . $name;
$body = "
<html>
<head>
<title>Новое сообщение с сайта</title>
</head>
<body>
<h2>Новое сообщение с сайта</h2>
<p><strong>Имя:</strong> {$name}</p>
<p><strong>Email:</strong> <a href='mailto:{$email_from}'>{$email_from}</a></p>
<p><strong>Телефон:</strong> <a href='tel:{$phone}'>{$phone}</a></p>
<p><strong>Сообщение:</strong></p>
<blockquote style='border-left: 4px solid #ddd; padding-left: 1em; margin: 1em 0;'>{$message_content}</blockquote>
<hr>
<p style='font-size: 0.9em; color: #666;'><em>Письмо отправлено с формы обратной связи на сайте transport-security-landing.</em></p>
</body>
</html>
";

// Подключаем PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Загружаем Composer autoloader (если установлен через Composer)
// require_once __DIR__ . '/vendor/autoload.php';
// ИЛИ если PHPMailer загружен вручную в папку phpmailer:
require_once __DIR__ . '/phpmailer/PHPMailer.php';
require_once __DIR__ . '/phpmailer/SMTP.php';
require_once __DIR__ . '/phpmailer/Exception.php';

// Создаем экземпляр PHPMailer
$mail = new PHPMailer(true);
$mail->CharSet = 'UTF-8';
$mail->Encoding = 'base64';

try {
    // Настройки сервера SMTP
    $mail->isSMTP();
    $mail->Host       = $smtp_host;
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtp_username;
    $mail->Password   = $smtp_password;
    $mail->SMTPSecure = $smtp_secure; // Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
    $mail->Port       = $smtp_port;
    $mail->SMTPOptions = [
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ];

    // Настройки отправителя и получателя
    $mail->setFrom($from_email, $from_name);
    $mail->addAddress($to_email);
    $mail->addReplyTo($email_from, $name); 

    // Настройки содержимого письма
    $mail->isHTML(true); // Set email format to HTML
    $mail->Subject = $subject;
    $mail->Body    = $body;
    $mail->AltBody = strip_tags($body); // Альтернативный текстовый вариант

    // Отправляем письмо
    $mail->send();
    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Сообщение успешно отправлено!"]);
} catch (Exception $e) {
    // Логируем ошибку в файл (опционально, для отладки)
    error_log("Ошибка отправки email: " . $mail->ErrorInfo);
    http_response_code(500); // Internal Server Error
    echo json_encode([
        "success" => false, 
        "message" => "Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте еще раз позже. Ошибка SMTP: " . $mail->ErrorInfo
    ]);
}
?>