<?php

namespace App\Http\Controllers;

use App\Models\WaStatus;
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

        $status = WaStatus::create([
            'text' => $request->text,
            'bg_color' => $request->bg_color ?? '#075e54',
            'scheduled_at' => $request->scheduled_at,
            'status' => $request->scheduled_at ? 'terjadwal' : 'terkirim',
            'sent_at' => $request->scheduled_at ? null : now()
        ]);

        return redirect()->back()->with('success', 'Jadwal status WhatsApp berhasil dibuat!');
    }

    public function destroy($id)
    {
        WaStatus::destroy($id);
        return redirect()->back()->with('success', 'Jadwal status berhasil dihapus.');
    }
}
