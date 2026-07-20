<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessBroadcastJob;
use App\Models\Broadcast;
use App\Models\BroadcastRecipient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BroadcastController extends Controller
{
    public function index()
    {
        $broadcasts = Broadcast::with('recipients')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Broadcast', [
            'broadcasts' => $broadcasts
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'title' => 'nullable|string',
            'attachment_type' => 'nullable|string',
            'media_url' => 'nullable|string',
            'send_schedule' => 'nullable|date',
            'recurrence_pattern' => 'nullable|string',
            'delay_min' => 'nullable|integer',
            'delay_max' => 'nullable|integer',
            'chunk_size' => 'nullable|integer',
            'pause_min' => 'nullable|integer',
            'pause_max' => 'nullable|integer',
            'recipients' => 'nullable|array'
        ]);

        $broadcast = Broadcast::create([
            'title' => $request->title,
            'content' => $request->content,
            'attachment_type' => $request->attachment_type ?? 'none',
            'media_url' => $request->media_url,
            'send_schedule' => $request->send_schedule,
            'recurrence_pattern' => $request->recurrence_pattern ?? 'once',
            'delay_min' => $request->delay_min ?? 2,
            'delay_max' => $request->delay_max ?? 5,
            'chunk_size' => $request->chunk_size ?? 10,
            'pause_min' => $request->pause_min ?? 10,
            'pause_max' => $request->pause_max ?? 20,
            'status' => $request->send_schedule ? 'scheduled' : 'processing',
            'total_recipients' => count($request->recipients ?? [])
        ]);

        if (!empty($request->recipients)) {
            foreach ($request->recipients as $item) {
                BroadcastRecipient::create([
                    'broadcast_id' => $broadcast->id,
                    'phone' => is_array($item) ? $item['phone'] : $item,
                    'name' => is_array($item) ? ($item['name'] ?? null) : null,
                    'status' => 'pending'
                ]);
            }
        }

        // Dispatch background Smart Blast job if not scheduled
        if (!$request->send_schedule) {
            ProcessBroadcastJob::dispatch($broadcast->id);
        }

        return redirect()->back()->with('success', 'Broadcast berhasil dibuat dan sedang diproses secara background dengan Smart Blast Protection!');
    }

    public function destroy($id)
    {
        Broadcast::destroy($id);
        return redirect()->back()->with('success', 'Broadcast berhasil dihapus.');
    }
}
