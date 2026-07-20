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
        return response()->json(['users' => \App\Models\User::all(['id', 'name', 'email', 'phone'])]); 
    })->name('crm.users');
    
    // Chat webhook simulation route
    Route::post('/dashboard/whatsapp/simulate', [\App\Http\Controllers\WhatsAppController::class, 'simulateChat'])->name('crm.whatsapp.simulate');

    // Promo Management CRUD (Knowledge Base)
    Route::resource('/dashboard/promos', \App\Http\Controllers\PromoController::class)->names('promos');

    // System Settings Configuration
    Route::get('/dashboard/settings', [\App\Http\Controllers\WhatsAppController::class, 'settingsPage'])->name('crm.settings');
    Route::post('/dashboard/settings', [\App\Http\Controllers\WhatsAppController::class, 'updateSettings'])->name('crm.settings.update');
    
    // Device Connected & Message Templates Pages (AUTOIN Suite Architecture)
    Route::get('/dashboard/device', function () {
        return Inertia::render('DeviceConnected');
    })->name('crm.device');

    Route::get('/dashboard/templates', function () {
        return Inertia::render('Templates');
    })->name('crm.templates');

    Route::get('/dashboard/broadcast', [\App\Http\Controllers\BroadcastController::class, 'index'])->name('crm.broadcast');
    Route::post('/dashboard/broadcast/store', [\App\Http\Controllers\BroadcastController::class, 'store'])->name('crm.broadcast.store');
    Route::delete('/dashboard/broadcast/{id}', [\App\Http\Controllers\BroadcastController::class, 'destroy'])->name('crm.broadcast.destroy');

    Route::get('/dashboard/quick-send', [\App\Http\Controllers\QuickSendController::class, 'index'])->name('crm.quick-send');
    Route::post('/dashboard/quick-send/send', [\App\Http\Controllers\QuickSendController::class, 'send'])->name('crm.quick-send.send');
    Route::delete('/dashboard/quick-send/{id}', [\App\Http\Controllers\QuickSendController::class, 'destroy'])->name('crm.quick-send.destroy');

    Route::get('/dashboard/status', [\App\Http\Controllers\WaStatusController::class, 'index'])->name('crm.status');
    Route::post('/dashboard/status/store', [\App\Http\Controllers\WaStatusController::class, 'store'])->name('crm.status.store');
    Route::delete('/dashboard/status/{id}', [\App\Http\Controllers\WaStatusController::class, 'destroy'])->name('crm.status.destroy');

    Route::post('/api/ai/polish', [\App\Http\Controllers\AiAssistantController::class, 'polish'])->name('api.ai.polish');

    Route::get('/dashboard/openwa/status', [\App\Http\Controllers\WhatsAppController::class, 'getOpenWaStatus'])->name('crm.openwa.status');
    Route::get('/dashboard/openwa/qr', [\App\Http\Controllers\WhatsAppController::class, 'getOpenWaQrCode'])->name('crm.openwa.qr');
    Route::post('/dashboard/openwa/pairing-code', [\App\Http\Controllers\WhatsAppController::class, 'getOpenWaPairingCode'])->name('crm.openwa.pairing-code');
    Route::post('/dashboard/openwa/pair', [\App\Http\Controllers\WhatsAppController::class, 'pairOpenWaSession'])->name('crm.openwa.pair');
    Route::post('/dashboard/openwa/unpair', [\App\Http\Controllers\WhatsAppController::class, 'unpairOpenWaSession'])->name('crm.openwa.unpair');

    // System self-update & Lead chat reset
    Route::post('/dashboard/system/update', [\App\Http\Controllers\WhatsAppController::class, 'runSystemUpdate'])->name('crm.system.update');
    Route::post('/dashboard/leads/{id}/reset', [\App\Http\Controllers\WhatsAppController::class, 'resetLeadChat'])->name('crm.leads.reset');
});

// Public Webhook route for real WhatsApp Gateway integration (Fonnte/Wablas/Qontak)
Route::post('/api/whatsapp/webhook', [\App\Http\Controllers\WhatsAppController::class, 'handleWebhook']);
Route::post('/api/whatsapp/status', [\App\Http\Controllers\WhatsAppController::class, 'updateGatewayStatus']);
Route::post('/api/whatsapp/manual-activity', [\App\Http\Controllers\WhatsAppController::class, 'handleManualActivity']);
Route::post('/api/whatsapp/check-mute', [\App\Http\Controllers\WhatsAppController::class, 'checkMuteStatus']);
require __DIR__.'/auth.php';
