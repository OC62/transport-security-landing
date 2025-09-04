const fs = require('fs');
const path = require('path');

// Функция для копирования файлов и папок
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Основная функция
function prepareApi() {
  const distDir = path.join(__dirname, '..', 'dist');
  const apiSrcDir = path.join(__dirname, '..', 'api');
  const apiDestDir = path.join(distDir, 'api');
  
  // Создаем папку dist если её нет
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Копируем папку api в dist
  console.log('Копируем папку api в dist...');
  copyRecursiveSync(apiSrcDir, apiDestDir);
  
  // Удаляем ненужные файлы из папки api в dist
  const filesToRemove = [
    'composer.json',
    'composer.lock',
    '.gitignore'
  ];
  
  filesToRemove.forEach(file => {
    const filePath = path.join(apiDestDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Удален файл: ${file}`);
    }
  });
  
  // Создаем .htaccess файлы
  console.log('Создаем .htaccess файлы...');
  
  // Корневой .htaccess
  const rootHtaccess = `# Включение механизма перезаписи
RewriteEngine On

# Перенаправление для React Router - все запросы, кроме api/ и файлов, идут на index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^ index.html [L]

# Настройки CORS для Яндекс Метрики и Капчи
<IfModule mod_headers.c>
    # Разрешаем запросы с доменов Яндекс
    SetEnvIf Origin "^(https?://([^/]+\.)?(smartcaptcha\.yandexcloud\.net|mc\.yandex\.ru))" allowed_origin=$0
    Header always set Access-Control-Allow-Origin "%{allowed_origin}e" env=allowed_origin
    Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header always set Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range"
    Header always set Access-Control-Allow-Credentials "true"
    Header always set Access-Control-Max-Age "1728000"
    Header always set Cross-Origin-Resource-Policy "cross-origin"
</IfModule>

# Обработка preflight OPTIONS запросов
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# Запретить доступ к .env файлам
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

# Запретить доступ к composer файлам
<Files "composer.*">
    Order allow,deny
    Deny from all
</Files>

# Запретить доступ к служебным файлам
<FilesMatch "^(\.htaccess|\.gitignore|\.env\.example|README\.md|package\.json|package-lock\.json)$">
    Order allow,deny
    Deny from all
</FilesMatch>

# Запретить листинг директорий
Options -Indexes

# Устанавливаем кодировку по умолчанию
AddDefaultCharset UTF-8

# Настройки кэширования для статических файлов
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType text/x-javascript "access plus 1 month"
    ExpiresByType application/x-shockwave-flash "access plus 1 month"
    ExpiresByType image/x-icon "access plus 1 year"
    ExpiresDefault "access plus 2 days"
</IfModule>

# Сжатие файлов
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>`;
  
  // .htaccess для API
  const apiHtaccess = `<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Разрешаем доступ только к send-email.php
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ send-email.php [L]
</IfModule>

<IfModule mod_headers.c>
    # Настройки CORS для API
    Header always set Access-Control-Allow-Origin "https://xn----9sb8ajp.xn--p1ai"
    Header always set Access-Control-Allow-Methods "POST, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Origin, X-Requested-With"
    Header always set Access-Control-Allow-Credentials "true"
</IfModule>

# Обработка preflight OPTIONS запросов для API
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# Запретить доступ к .env файлам
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

# Запросить доступ к composer файлам
<Files "composer.*">
    Order allow,deny
    Deny from all
</Files>

# Запросить доступ к служебным файлам
<FilesMatch "^(\.htaccess|\.gitignore|README\.md)$">
    Order allow,deny
    Deny from all
</FilesMatch>

# Запросить листинг директорий
Options -Indexes

# Устанавливаем правильные Content-Type для PHP файлов
<Files "*.php">
    SetHandler application/x-httpd-php
</Files>

# Защищаем от распространенных атак
<IfModule mod_security.c>
    SecFilterEngine Off
    SecFilterScanPOST Off
</IfModule>

# Устанавливаем кодировку по умолчанию
AddDefaultCharset UTF-8`;

  // Записываем .htaccess файлы
  fs.writeFileSync(path.join(distDir, '.htaccess'), rootHtaccess);
  fs.writeFileSync(path.join(apiDestDir, '.htaccess'), apiHtaccess);
  
  console.log('Подготовка папки api завершена!');
}

// Запускаем подготовку
prepareApi();