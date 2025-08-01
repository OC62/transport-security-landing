// backend/server.js
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Загружаем переменные окружения из .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Разрешаем CORS-запросы с любого источника (или укажите конкретный origin)
app.use(express.json({ limit: '10mb' })); // Парсим JSON в теле запроса, увеличиваем лимит до 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Парсим URL-encoded данные

// --- Настройка Nodemailer ---
// Создаем объект transporter с настройками SMTP
let transporter;
try {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_SECURE === 'true', // true для 465, false для других портов
        auth: {
            user: process.env.SMTP_USER, // Ваш email
            pass: process.env.SMTP_PASS, // Ваш пароль приложения
        },
        tls: {
            // Не требовать действительный сертификат (для самоподписанных, НЕ рекомендуется для продакшена)
            rejectUnauthorized: false, 
        },
    });
} catch (error) {
    console.error('Ошибка при создании transporter nodemailer:', error);
    process.exit(1); // Завершаем процесс с ошибкой
}

// --- Маршрут для отправки email ---
app.post('/send-email', async (req, res) => {
    console.log('Получен POST-запрос на /send-email:', req.body);

    const { name, email, phone, message } = req.body;

    // Базовая валидация (на бэкенде тоже стоит проверять!)
    if (!name || !email || !phone || !message) {
        console.error('Ошибка валидации: отсутствуют обязательные поля');
        return res.status(400).json({ success: false, message: 'Все поля обязательны для заполнения.' });
    }

    // Проверка email на корректность (простая)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.error('Ошибка валидации: некорректный email');
        return res.status(400).json({ success: false, message: 'Некорректный формат email.' });
    }

    // Формируем HTML-тело письма
    const mailOptions = {
        from: `"Форма обратной связи" <${process.env.SMTP_USER}>`, // От кого (можно указать другое имя)
        to: process.env.EMAIL_TO, // Кому (ваш email)
        subject: `Новое сообщение с сайта от ${name}`, // Тема письма
        text: `Имя: ${name}\nEmail: ${email}\nТелефон: ${phone}\nСообщение: ${message}`, // Текстовая версия (на случай, если HTML не поддерживается)
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Новое сообщение с сайта</h2>
            <p><strong>Имя:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Телефон:</strong> <a href="tel:${phone}">${phone}</a></p>
            <p><strong>Сообщение:</strong></p>
            <blockquote style="border-left: 4px solid #ddd; padding-left: 1em; margin: 1em 0;">${message}</blockquote>
            <hr>
            <p style="font-size: 0.9em; color: #666;"><em>Письмо отправлено с формы обратной связи на сайте transport-security-landing.</em></p>
        </div>
        `, // HTML-версия письма
    };

    try {
        // Отправляем email
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email успешно отправлен:', info.response);
        // Отправляем успешный ответ клиенту
        res.status(200).json({ success: true, message: 'Сообщение успешно отправлено!' });
    } catch (error) {
        console.error('❌ Ошибка при отправке email:', error);
        // Отправляем ответ об ошибке клиенту
        res.status(500).json({ success: false, message: 'Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте еще раз позже.' });
    }
});

// --- Обслуживание статических файлов (опционально, если нужно) ---
// Если вы хотите, чтобы бэкенд также отдавал фронтенд (например, из папки ../dist),
// раскомментируйте следующие строки:
/*
const DIST_DIR = path.join(__dirname, '..', 'dist');
app.use(express.static(DIST_DIR));

// Обработка всех остальных запросов (для SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
});
*/

// --- Запуск сервера ---
app.listen(PORT, '0.0.0.0', () => { // Слушаем на всех интерфейсах (0.0.0.0) для Docker/облака
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📬 Готов принимать запросы на http://localhost:${PORT}/send-email`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Сервер останавливается...');
    process.exit(0);
});