<?php
header('Access-Control-Allow-Origin: https://xn----9sb8ajp.xn--p1ai');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Включение отображения ошибок для диагностики
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Проверка доступности vendor/autoload.php
$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Autoload not found',
        'path' => $autoloadPath,
        'files' => scandir(__DIR__)
    ]);
    exit;
}

// Проверка загрузки PHPMailer
try {
    require_once $autoloadPath;
    
    // Проверка существования классов
    if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
        echo json_encode([
            'status' => 'error', 
            'message' => 'PHPMailer class not found'
        ]);
        exit;
    }
    
    if (!class_exists('Dotenv\Dotenv')) {
        echo json_encode([
            'status' => 'error', 
            'message' => 'Dotenv class not found'
        ]);
        exit;
    }
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Dependencies loaded successfully',
        'php_version' => PHP_VERSION,
        'extensions' => get_loaded_extensions()
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Exception: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}