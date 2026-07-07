<?php
// Standalone script to test environment keys on the VPS
header('Content-Type: text/plain');

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    $openaiKey = env('OPENAI_API_KEY');
    $geminiKey = env('GEMINI_API_KEY');
    
    echo "OPENAI_KEY_EXISTS: " . (empty($openaiKey) ? 'No' : 'Yes') . "\n";
    echo "OPENAI_KEY_LENGTH: " . strlen($openaiKey) . "\n";
    echo "GEMINI_KEY_EXISTS: " . (empty($geminiKey) ? 'No' : 'Yes') . "\n";
    echo "GEMINI_KEY_LENGTH: " . strlen($geminiKey) . "\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
