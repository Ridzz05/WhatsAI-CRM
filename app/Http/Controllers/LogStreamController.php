<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class LogStreamController extends Controller
{
    /**
     * Render the Live System Logs console page.
     */
    public function index()
    {
        return Inertia::render('LiveLogs');
    }

    /**
     * Fetch recent structured log lines from storage/logs/laravel.log for live stream polling.
     */
    public function fetchLogs(Request $request)
    {
        $logPath = storage_path('logs/laravel.log');
        
        if (!File::exists($logPath)) {
            return response()->json(['logs' => [], 'raw' => '']);
        }

        // Read last 150 lines of log file
        $content = File::get($logPath);
        $lines = explode("\n", $content);
        $recentLines = array_slice(array_filter($lines), -150);

        $parsedLogs = [];

        foreach ($recentLines as $line) {
            $trimmed = trim($line);
            if (empty($trimmed)) continue;

            $category = 'SYSTEM';
            $level = 'INFO';
            $timestamp = null;

            // Extract timestamp [YYYY-MM-DD HH:MM:SS]
            if (preg_match('/^\[(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\]\s(\w+)\.([A-Z]+):\s(.*)$/', $trimmed, $matches)) {
                $timestamp = $matches[1];
                $level = strtoupper($matches[3]);
                $messageBody = $matches[4];

                if (str_contains($messageBody, '📨 [WhatsApp Webhook]')) {
                    $category = 'WEBHOOK';
                } elseif (str_contains($messageBody, '🤖 [WhatsApp AI]')) {
                    $category = 'AI_REPLY';
                } elseif (str_contains($messageBody, '🛑 [WhatsApp AI]') || str_contains($messageBody, '👤 [WhatsApp CS]')) {
                    $category = 'CS_MUTE';
                } elseif ($level === 'ERROR') {
                    $category = 'ERROR';
                }

                $parsedLogs[] = [
                    'timestamp' => $timestamp,
                    'level' => $level,
                    'category' => $category,
                    'message' => $messageBody,
                    'raw' => $trimmed
                ];
            } else {
                // Continuation line or stack trace
                $parsedLogs[] = [
                    'timestamp' => null,
                    'level' => 'DEBUG',
                    'category' => 'TRACE',
                    'message' => $trimmed,
                    'raw' => $trimmed
                ];
            }
        }

        return response()->json([
            'logs' => array_values($parsedLogs),
            'log_size' => File::size($logPath)
        ]);
    }

    /**
     * Clear log file contents.
     */
    public function clearLogs()
    {
        $logPath = storage_path('logs/laravel.log');
        if (File::exists($logPath)) {
            File::put($logPath, '');
        }

        return response()->json([
            'success' => true,
            'message' => 'Log terminal console berhasil dibersihkan.'
        ]);
    }
}
