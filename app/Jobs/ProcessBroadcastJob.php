<?php

namespace App\Jobs;

use App\Models\Broadcast;
use App\Models\BroadcastRecipient;
use App\Services\OpenWaService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessBroadcastJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $broadcastId;

    public function __construct($broadcastId)
    {
        $this->broadcastId = $broadcastId;
    }

    public function handle()
    {
        $broadcast = Broadcast::with('recipients')->find($this->broadcastId);
        if (!$broadcast || $broadcast->status === 'completed') {
            return;
        }

        $broadcast->update(['status' => 'processing']);
        Log::info("Starting Broadcast ID {$broadcast->id} with Smart Blast Anti-Ban protection.");

        $recipients = $broadcast->recipients->where('status', 'pending')->all();
        // Smart Blast: Shuffle recipient order to avoid pattern detection
        shuffle($recipients);

        $sentCount = 0;
        $failedCount = 0;

        foreach ($recipients as $index => $recipient) {
            // Personalize message content
            $content = $broadcast->content;
            $name = $recipient->name ?? 'Pelanggan';
            $content = str_replace('{{nama}}', $name, $content);
            $content = str_replace('{{nomor}}', $recipient->phone, $content);
            $content = str_replace('{{tanggal}}', date('d/m/Y'), $content);
            $content = str_replace('{{waktu}}', date('H:i'), $content);

            // Send via OpenWA Service
            $res = OpenWaService::sendMessage($recipient->phone, $content);

            if ($res['success']) {
                $recipient->update([
                    'status' => 'sent',
                    'sent_at' => now()
                ]);
                $sentCount++;
            } else {
                $recipient->update([
                    'status' => 'failed',
                    'error_message' => $res['message'] ?? 'Failed to send'
                ]);
                $failedCount++;
            }

            // Update broadcast counters
            $broadcast->update([
                'sent_count' => $broadcast->sent_count + ($res['success'] ? 1 : 0),
                'failed_count' => $broadcast->failed_count + ($res['success'] ? 0 : 1)
            ]);

            // Smart Blast Anti-Ban: Jeda Acak Antar Pesan (delay_min to delay_max)
            $delay = rand($broadcast->delay_min, $broadcast->delay_max);
            sleep($delay);

            // Smart Blast Anti-Ban: Istirahat Tiap Chunk (chunk_size)
            if (($index + 1) % $broadcast->chunk_size === 0 && ($index + 1) < count($recipients)) {
                $pause = rand($broadcast->pause_min, $broadcast->pause_max);
                Log::info("Smart Blast Chunk pause for {$pause} seconds after " . ($index + 1) . " messages.");
                sleep($pause);
            }
        }

        $broadcast->update(['status' => 'completed']);
        Log::info("Completed Broadcast ID {$broadcast->id}. Sent: {$sentCount}, Failed: {$failedCount}");
    }
}
