import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function prepareApi() {
  const distDir = path.join(__dirname, '..', 'dist');
  const apiSrcDir = path.join(__dirname, '..', 'api');
  const apiDestDir = path.join(distDir, 'api');
  
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  console.log('Копируем папку api в dist...');
  copyRecursiveSync(apiSrcDir, apiDestDir);
  
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

  // ✅ УДАЛЯЕМ .htaccess из api/ — он не работает на nginx
  const apiHtaccess = path.join(apiDestDir, '.htaccess');
  if (fs.existsSync(apiHtaccess)) {
    fs.unlinkSync(apiHtaccess);
    console.log('Удалён .htaccess из dist/api — не нужен на nginx');
  }

  // ✅ ОСТАВЛЯЕМ .htaccess в корне ТОЛЬКО если он нужен для редиректов (React Router)
  const rootHtaccess = `# Включение механизма перезаписи
RewriteEngine On

# Перенаправление для React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^ index.html [L]

# Запрет доступа к служебным файлам
<Files ".env">
    Order allow,deny
    Deny from all
</Files>
<Files "composer.*">
    Order allow,deny
    Deny from all
</Files>
<FilesMatch "^(\.htaccess|\.gitignore|README\.md|package\.json)$">
    Order allow,deny
    Deny from all
</FilesMatch>

# Запрет листинга директорий
Options -Indexes

# Кэширование статики
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresDefault "access plus 2 days"
</IfModule>

# Сжатие
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/javascript
</IfModule>`;

  // ✅ Записываем .htaccess только в корень (для React Router)
  fs.writeFileSync(path.join(distDir, '.htaccess'), rootHtaccess);
  console.log('Создан .htaccess в корне для React Router и кэширования');

  console.log('Подготовка папки api завершена!');
}

prepareApi();