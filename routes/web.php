<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // CRM API/Ajax routes for WhatsApp AI Assistant
    Route::get('/dashboard/leads', [\App\Http\Controllers\WhatsAppController::class, 'getLeads'])->name('crm.leads');
    Route::get('/dashboard/leads/{id}/chat', [\App\Http\Controllers\WhatsAppController::class, 'getLeadConversations'])->name('crm.leads.chat');
    Route::get('/dashboard/stats', [\App\Http\Controllers\WhatsAppController::class, 'getDashboardStats'])->name('crm.stats');
    Route::post('/dashboard/leads/{lead}/assign', [\App\Http\Controllers\WhatsAppController::class, 'assignLead'])->name('crm.leads.assign');
    Route::post('/dashboard/leads/{lead}/status', [\App\Http\Controllers\WhatsAppController::class, 'updateLeadStatus'])->name('crm.leads.status');
    Route::get('/dashboard/users', function () { 
        return response()->json(['users' => \App\Models\User::all(['id', 'name', 'email'])]); 
    })->name('crm.users');
    
    // Chat webhook simulation route
    Route::post('/dashboard/whatsapp/simulate', [\App\Http\Controllers\WhatsAppController::class, 'simulateChat'])->name('crm.whatsapp.simulate');

    // Promo Management CRUD (Knowledge Base)
    Route::resource('/dashboard/promos', \App\Http\Controllers\PromoController::class)->names('promos');

    // System Settings Configuration
    Route::get('/dashboard/settings', [\App\Http\Controllers\WhatsAppController::class, 'settingsPage'])->name('crm.settings');
    Route::post('/dashboard/settings', [\App\Http\Controllers\WhatsAppController::class, 'updateSettings'])->name('crm.settings.update');
    
    // System self-update & Lead chat reset
    Route::post('/dashboard/system/update', [\App\Http\Controllers\WhatsAppController::class, 'runSystemUpdate'])->name('crm.system.update');
    Route::post('/dashboard/leads/{id}/reset', [\App\Http\Controllers\WhatsAppController::class, 'resetLeadChat'])->name('crm.leads.reset');
});

// Public Webhook route for real WhatsApp Gateway integration (Fonnte/Wablas/Qontak)
Route::post('/api/whatsapp/webhook', [\App\Http\Controllers\WhatsAppController::class, 'handleWebhook']);
Route::post('/api/whatsapp/status', [\App\Http\Controllers\WhatsAppController::class, 'updateGatewayStatus']);
require __DIR__.'/auth.php';
