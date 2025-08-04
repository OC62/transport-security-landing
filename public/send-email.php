<?php
// send-email.php

// --- НАСТРОЙКИ ---
$smtp_host = 'smtp.gmail.com';
$smtp_port = 587;
$smtp_secure = 'tls';
$smtp_username = 'oc611164@gmail.com';
$smtp_password = 'bnwa lhco lnij xnzi';
$from_email = 'oc611164@gmail.com';
$from_name = 'Форма обратной связи ПТБ-М';
$to_email = 'oc611164@gmail.com';
// --- КОНЕЦ НАСТРОЕК ---

// Устанавливаем кодировку UTF-8 для всего скрипта
header("Access-Control-Allow-Origin: https://ПТБ-М.РФ");
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
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Метод не разрешен"]);
    exit();
}

// Получаем данные
$input = json_decode(file_get_contents("php://input"), true) ?: $_POST;

// Валидация полей
$required_fields = ["name", "email", "phone", "message"];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Все поля обязательны для заполнения."]);
        exit();
    }
}

// Санитизация данных с сохранением кириллицы
$name = mb_convert_encoding(trim($input["name"]), 'UTF-8', 'UTF-8');
$email_from = filter_var(trim($input["email"]), FILTER_SANITIZE_EMAIL);
$phone = preg_replace('/[^0-9+]/', '', trim($input["phone"]));
$message_content = mb_convert_encoding(trim($input["message"]), 'UTF-8', 'UTF-8');

// Подключаем PHPMailer
require_once __DIR__ . '/phpmailer/PHPMailer.php';
require_once __DIR__ . '/phpmailer/SMTP.php';
require_once __DIR__ . '/phpmailer/Exception.php';

$mail = new PHPMailer(true);
$mail->CharSet = 'UTF-8';
$mail->Encoding = 'base64';

try {
    // Настройки SMTP
    $mail->isSMTP();
    $mail->Host = $smtp_host;
    $mail->SMTPAuth = true;
    $mail->Username = $smtp_username;
    $mail->Password = $smtp_password;
    $mail->SMTPSecure = $smtp_secure;
    $mail->Port = $smtp_port;
    $mail->SMTPOptions = [
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ];

    // Отправитель и получатель
    $mail->setFrom($from_email, $from_name);
    $mail->addAddress($to_email);
    $mail->addReplyTo($email_from, $name);

    // Тема и тело письма
    $mail->Subject = "Новое сообщение с сайта от " . $name;
    
    // HTML-версия
    $mail->isHTML(true);
    $mail->Body = "
    <!DOCTYPE html>
    <html lang='ru'>
    <head>
        <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
        <title>Новое сообщение с сайта</title>
    </head>
    <body>
        <h2>Новое сообщение с сайта</h2>
        <p><strong>Имя:</strong> {$name}</p>
        <p><strong>Email:</strong> <a href='mailto:{$email_from}'>{$email_from}</a></p>
        <p><strong>Телефон:</strong> <a href='tel:{$phone}'>{$phone}</a></p>
        <p><strong>Сообщение:</strong></p>
        <div style='border-left: 3px solid #ccc; padding-left: 10px; margin: 10px 0;'>
            " . nl2br($message_content) . "
        </div>
        <hr>
        <p style='color: #777; font-size: 0.9em;'>
            Сообщение отправлено с формы обратной связи сайта ПТБ-М
        </p>
    </body>
    </html>";

    // Текстовая версия
    $mail->AltBody = "Имя: {$name}\nEmail: {$email_from}\nТелефон: {$phone}\n\nСообщение:\n{$message_content}";

    // Отправка
    $mail->send();
    echo json_encode(["success" => true, "message" => "Сообщение успешно отправлено!"]);
    
} catch (Exception $e) {
    error_log("Email Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Ошибка при отправке: " . $e->getMessage()
    ]);
}
?>