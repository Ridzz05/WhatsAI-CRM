<?php
// Standalone script to test database query on the VPS
header('Content-Type: text/plain');

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    $promos = \App\Models\Promo::where('is_active', true)->get();
    echo "PROMOS COUNT: " . $promos->count() . "\n";
    foreach ($promos as $p) {
        echo "- " . $p->promo_name . " (Active: " . ($p->is_active ? 'Yes' : 'No') . ", Date: " . ($p->valid_until ? $p->valid_until->format('Y-m-d') : 'None') . ")\n";
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
