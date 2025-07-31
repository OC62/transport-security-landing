#!/bin/bash
# scripts/deploy-lftp.sh (Исправленная версия 3)

# --- НАСТРОЙКИ ---
REGRU_FTP_HOST="${REGRU_FTP_HOST:-31.31.197.13}"
REGRU_FTP_USER="${REGRU_FTP_USER:-u3211073}"
REGRU_FTP_PASSWORD="${REGRU_FTP_PASSWORD:-tfGE0830Cy3IBmTf}"
REGRU_FTP_PORT="${REGRU_FTP_PORT:-21}"
REGRU_FTP_REMOTE_PATH="${REGRU_FTP_REMOTE_PATH:-/www/xn----9sb8ajp.xn--p1ai/}"
LOCAL_DIST_PATH="./dist"
# --- КОНЕЦ НАСТРОЕК ---

echo "Конфигурация деплоя (LFTP):"
echo "  Хост: $REGRU_FTP_HOST"
echo "  Пользователь: $REGRU_FTP_USER"
echo "  Порт: $REGRU_FTP_PORT"
echo "  Удалённый путь: $REGRU_FTP_REMOTE_PATH"
echo "  Локальный путь: $LOCAL_DIST_PATH"
echo ""

if [ ! -d "$LOCAL_DIST_PATH" ]; then
  echo "❌ Ошибка: Папка $LOCAL_DIST_PATH не найдена. Сначала выполните 'npm run build'."
  exit 1
fi

if ! command -v lftp &> /dev/null
then
    echo "❌ Ошибка: lftp не найден. Установите его, например, 'sudo apt install lftp'."
    exit 1
fi

echo "🚀 Начинается загрузка файлов из $LOCAL_DIST_PATH на ftp://$REGRU_FTP_USER@$REGRU_FTP_HOST:$REGRU_FTP_PORT$REGRU_FTP_REMOTE_PATH..."

# Флаг для отслеживания успешного завершения сессии lftp
LFTP_SUCCESS=0

# Используем here-document для передачи команд в lftp
# ВАЖНО: EOF не должен быть в кавычках, и внутри блока нельзя использовать конструкции Bash (if, echo и т.д.) напрямую без экранирования
lftp_out=$(lftp <<END_OF_LFTP_SESSION
    # Настройки для надежного подключения и отладки
    set net:socket-buffer 32768
    set net:timeout "60s" # Правильный формат таймаута
    set net:max-retries 2
    set net:reconnect-interval-base 2
    set net:reconnect-interval-multiplier 1
    set net:reconnect-interval-max 10

    # Критически важные настройки FTP
    set ftp:ssl-force false
    set ftp:ssl-protect-data false
    set ftp:passive-mode true
    set ftp:use-stat false
    set ftp:use-mdtm off
    set ftp:prefer-epsv false

    # Отладка
    # debug 3

    # 1. Подключение
    echo ">>> Попытка подключения к ftp://$REGRU_FTP_HOST:$REGRU_FTP_PORT..."
    open -u "$REGRU_FTP_USER" "$REGRU_FTP_PASSWORD" -p $REGRU_FTP_PORT "ftp://$REGRU_FTP_HOST"
    if [ \$? -ne 0 ]; then
        echo ">>> ОШИБКА: Не удалось подключиться к серверу."
        quit 1
    fi
    echo ">>> Подключение успешно."

    # 2. Переход в директорию
    echo ">>> Попытка перехода в директорию '$REGRU_FTP_REMOTE_PATH'..."
    cd "$REGRU_FTP_REMOTE_PATH"
    if [ \$? -ne 0 ]; then
        echo ">>> ОШИБКА: Не удалось перейти в директорию '$REGRU_FTP_REMOTE_PATH'."
        quit 1
    fi
    echo ">>> Переход в директорию успешен."

    # 3. Загрузка файлов
    echo ">>> Начало загрузки файлов..."
    # Используем put для загрузки всего содержимого dist рекурсивно
    # mirror --reverse --delete --verbose=1 --parallel=2 --ignore-time \
    #        --exclude='*.md' --exclude='.git*' --exclude='node_modules' \
    #        "$LOCAL_DIST_PATH" "."
    # Альтернатива: команда put может быть более стабильна для загрузки папки
    # upload -r "$LOCAL_DIST_PATH"/*
    mirror --reverse --delete --verbose=1 --parallel=2 --ignore-time "$LOCAL_DIST_PATH" "."
    PUT_EXIT_CODE=\$?
    if [ \$PUT_EXIT_CODE -ne 0 ]; then
        echo ">>> ОШИБКА: Загрузка файлов завершилась с кодом \$PUT_EXIT_CODE."
        quit 1
    fi
    echo ">>> Загрузка файлов завершена успешно."

    echo ">>> Завершение сессии..."
    quit 0
END_OF_LFTP_SESSION
)

# Выводим результат сессии lftp
echo "$lftp_out"

# Проверяем, были ли критические ошибки в выводе lftp
if echo "$lftp_out" | grep -q ">>> ОШИБКА:"; then
    echo ""
    echo "❌ Критическая ошибка в процессе деплоя (см. лог выше)."
    exit 1
fi

# Проверяем финальное сообщение об успехе
if echo "$lftp_out" | grep -q ">>> Загрузка файлов завершена успешно."; then
    echo ""
    echo "✅ Деплой через LFTP завершен успешно!"
else
    echo ""
    echo "⚠️  Деплой завершен, но статус неясен. Проверьте файлы на сервере."
fi