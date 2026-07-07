<?php
// Standalone script to rescue user account on the VPS
header('Content-Type: text/plain');

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    // 1. Get all users
    $users = \App\Models\User::all();
    echo "TOTAL USERS: " . $users->count() . "\n\n";
    
    foreach ($users as $u) {
        echo "ID: {$u->id}\n";
        echo "Name: {$u->name}\n";
        echo "Email: {$u->email}\n";
        echo "Email Verified At: " . ($u->email_verified_at ? $u->email_verified_at->toDateTimeString() : 'NULL') . "\n";
        echo "-------------------\n";
    }
    
    // 2. Rescue: Find first user or find by email
    $user = \App\Models\User::where('email', 'crm@loyalfitness.id')->first();
    if (!$user) {
        $user = \App\Models\User::first();
    }
    
    if ($user) {
        echo "Rescuing User: ID {$user->id} ({$user->email})\n";
        
        // Update to desired credentials
        $user->email = 'crm@loyalfitness.id';
        $user->password = \Illuminate\Support\Facades\Hash::make('CRMLoyal123');
        $user->email_verified_at = \Carbon\Carbon::now();
        $user->save();
        
        echo "RESCUE SUCCESSFUL: Email set to 'crm@loyalfitness.id', password reset to 'CRMLoyal123', and email verified!\n";
    } else {
        echo "No users found in database to rescue!\n";
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
