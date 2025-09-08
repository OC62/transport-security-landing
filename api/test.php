<?php
echo "<pre>";
echo "PHP: " . PHP_VERSION . "\n";
echo "Autoload: " . (file_exists('vendor/autoload.php') ? '✅ YES' : '❌ NO') . "\n";
echo "ENV: " . (file_exists('.env') ? '✅ YES' : '❌ NO') . "\n";
echo "</pre>";
?>