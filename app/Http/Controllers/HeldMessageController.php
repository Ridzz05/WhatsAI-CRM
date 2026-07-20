<?php

namespace App\Http\Controllers;

use App\Models\HeldMessageLog;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class HeldMessageController extends Controller
{
    /**
     * Display a listing of held/muted messages.
     */
    public function index(Request $request)
    {
        $search = trim($request->input('search', ''));

        $query = HeldMessageLog::with('lead')->latest();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('phone', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%")
                  ->orWhere('reason', 'like', "%{$search}%");
            });
        }

        $logs = $query->paginate(15)->withQueryString();

        // Attach live cache mute status
        $logs->getCollection()->transform(function ($log) {
            $cleanPhone = preg_replace('/[^0-9]/', '', $log->phone);
            $log->is_cache_muted = Cache::has("whatsapp_mute_ai_{$cleanPhone}");
            return $log;
        });

        // Summary stats
        $stats = [
            'total_held' => HeldMessageLog::where('status', 'held')->count(),
            'active_cache_mutes' => HeldMessageLog::where('status', 'held')
                ->where('muted_until', '>', now())
                ->count(),
            'total_restored' => HeldMessageLog::where('status', 'restored')->count(),
        ];

        return Inertia::render('HeldMessages', [
            'logs' => $logs,
            'filters' => ['search' => $search],
            'stats' => $stats,
        ]);
    }

    /**
     * Restore AI Auto-Reply for a held message & lead.
     */
    public function restore($id)
    {
        $log = HeldMessageLog::findOrFail($id);
        $cleanPhone = preg_replace('/[^0-9]/', '', $log->phone);

        // Clear 30-min AI mute cache
        Cache::forget("whatsapp_mute_ai_{$cleanPhone}");

        // Restore Lead status if currently Handover to CS
        if ($log->lead) {
            if (in_array($log->lead->status, ['Handover to CS'])) {
                $log->lead->status = 'Cold';
                $log->lead->save();
            }
        } else {
            $lead = Lead::where('phone', $cleanPhone)->first();
            if ($lead && in_array($lead->status, ['Handover to CS'])) {
                $lead->status = 'Cold';
                $lead->save();
            }
        }

        // Mark log status as restored
        $log->status = 'restored';
        $log->save();

        return redirect()->back()->with('success', "AI Auto-Reply berhasil diaktifkan kembali untuk nomor +{$cleanPhone}.");
    }

    /**
     * Delete a held message log entry.
     */
    public function destroy($id)
    {
        $log = HeldMessageLog::findOrFail($id);
        $log->delete();

        return redirect()->back()->with('success', 'Entri log pesan ditahan berhasil dihapus.');
    }
}
