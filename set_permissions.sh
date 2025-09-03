#!/bin/bash

echo "Настройка прав доступа для проекта..."

# Установка прав для корневой директории
chmod 755 .

# Установка прав для всех директорий
find . -type d -exec chmod 755 {} \;

# Установка прав для всех файлов
find . -type f -exec chmod 644 {} \;

# Особые права для .env файлов
find . -name ".env" -exec chmod 600 {} \;

# Особые права для исполняемых файлов (если есть)
find . -name "*.sh" -exec chmod +x {} \;

# Права для папки api
if [ -d "api" ]; then
    echo "Настройка прав для папки api..."
    chmod 755 api
    chmod 644 api/send-email.php
    chmod 644 api/composer.json
    chmod 644 api/.htaccess
    
    # Права для vendor в api
    if [ -d "api/vendor" ]; then
        find api/vendor -type d -exec chmod 755 {} \;
        find api/vendor -type f -exec chmod 644 {} \;
    fi
fi

echo "Права доступа успешно настроены!"