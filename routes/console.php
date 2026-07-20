<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\WaStatus;
use App\Models\Broadcast;
use App\Services\OpenWaService;
use App\Jobs\ProcessBroadcastJob;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule 1: Process Scheduled WhatsApp Story Statuses Every Minute
Schedule::call(function () {
    $scheduledStatuses = WaStatus::where('status', 'terjadwal')
        ->whereNotNull('scheduled_at')
        ->where('scheduled_at', '<=', now())
        ->get();

    foreach ($scheduledStatuses as $status) {
        $res = OpenWaService::sendStatus($status->text, $status->bg_color);
        $status->update([
            'status' => $res['success'] ? 'terkirim' : 'gagal',
            'sent_at' => now()
        ]);
    }
})->everyMinute();

// Schedule 2: Process Scheduled Broadcast Campaigns Every Minute
Schedule::call(function () {
    $scheduledBroadcasts = Broadcast::where('status', 'scheduled')
        ->whereNotNull('send_schedule')
        ->where('send_schedule', '<=', now())
        ->get();

    foreach ($scheduledBroadcasts as $broadcast) {
        ProcessBroadcastJob::dispatch($broadcast->id);
    }
})->everyMinute();
