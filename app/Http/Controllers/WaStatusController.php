<?php

namespace App\Http\Controllers;

use App\Models\WaStatus;
use App\Services\OpenWaService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WaStatusController extends Controller
{
    public function index()
    {
        $statuses = WaStatus::orderBy('created_at', 'desc')->get();

        return Inertia::render('JadwalStatus', [
            'statuses' => $statuses
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
            'bg_color' => 'nullable|string',
            'scheduled_at' => 'nullable|date'
        ]);

        $bgColor = $request->bg_color ?? '#075e54';
        $statusState = 'terjadwal';
        $sentAt = null;

        // Instant post execution via OpenWA Service if no schedule is provided
        if (empty($request->scheduled_at)) {
            $res = OpenWaService::sendStatus($request->text, $bgColor);
            $statusState = $res['success'] ? 'terkirim' : 'gagal';
            $sentAt = now();
        }

        $status = WaStatus::create([
            'text' => $request->text,
            'bg_color' => $bgColor,
            'scheduled_at' => $request->scheduled_at,
            'status' => $statusState,
            'sent_at' => $sentAt
        ]);

        return redirect()->back()->with('success', 'Status WhatsApp berhasil diproses!');
    }

    public function destroy($id)
    {
        WaStatus::destroy($id);
        return redirect()->back()->with('success', 'Jadwal status berhasil dihapus.');
    }
}
