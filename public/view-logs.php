<?php
// Standalone script to inspect laravel.log on the VPS
header('Content-Type: text/plain');

$logPath = __DIR__.'/../storage/logs/laravel.log';

if (file_exists($logPath)) {
    $lines = file($logPath);
    $lastLines = array_slice($lines, -80);
    echo implode("", $lastLines);
} else {
    echo "Log file not found at: " . $logPath . "\n";
}
