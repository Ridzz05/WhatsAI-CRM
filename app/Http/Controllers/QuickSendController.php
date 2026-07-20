<?php

namespace App\Http\Controllers;

use App\Models\QuickSendLog;
use App\Services\OpenWaService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuickSendController extends Controller
{
    public function index()
    {
        $logs = QuickSendLog::orderBy('created_at', 'desc')->take(50)->get();

        return Inertia::render('QuickSend', [
            'logs' => $logs
        ]);
    }

    public function send(Request $request)
    {
        $request->validate([
            'recipients' => 'required|string',
            'message' => 'required|string',
            'channel' => 'nullable|string',
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,pdf,doc,docx|max:10240'
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('quick_send_attachments', 'public');
        }

        $rawRecipients = explode("\n", str_replace(",", "\n", $request->recipients));
        $sentLogs = [];

        foreach ($rawRecipients as $raw) {
            $raw = trim($raw);
            if (empty($raw)) continue;

            $parts = explode('|', $raw);
            $phone = trim($parts[0]);
            $name = isset($parts[1]) ? trim($parts[1]) : 'Pelanggan';

            // Replace dynamic variables
            $parsedMessage = str_replace('{{nama}}', $name, $request->message);
            $parsedMessage = str_replace('{{nomor}}', $phone, $parsedMessage);
            $parsedMessage = str_replace('{{tanggal}}', date('d/m/Y'), $parsedMessage);
            $parsedMessage = str_replace('{{waktu}}', date('H:i'), $parsedMessage);

            // Deliver via OpenWA Gateway Service
            if ($attachmentPath && file_exists(storage_path('app/public/' . $attachmentPath))) {
                $fullPath = storage_path('app/public/' . $attachmentPath);
                $res = OpenWaService::sendMedia($phone, $parsedMessage, $fullPath);
            } else {
                $res = OpenWaService::sendMessage($phone, $parsedMessage);
            }

            $log = QuickSendLog::create([
                'phone' => $phone,
                'name' => $name,
                'message' => $parsedMessage,
                'channel' => $request->channel ?? 'openwa',
                'status' => ($res['success'] ?? false) ? 'terkirim' : 'gagal',
                'sent_at' => now()
            ]);

            $sentLogs[] = $log;
        }

        return redirect()->back()->with('success', 'Pesan berhasil dikirim secara instan ke ' . count($sentLogs) . ' nomor tujuan!');
    }

    public function destroy($id)
    {
        QuickSendLog::destroy($id);
        return redirect()->back()->with('success', 'Riwayat pengiriman berhasil dihapus.');
    }
}
