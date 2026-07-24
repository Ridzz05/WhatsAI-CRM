<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class DeviceController extends Controller
{
    /**
     * Display list of connected WhatsApp devices.
     */
    public function index()
    {
        $devices = Device::with('branch')->orderBy('created_at', 'desc')->get();
        $branches = Branch::where('is_active', true)->get();

        return Inertia::render('DeviceConnected', [
            'devices' => $devices,
            'branches' => $branches,
        ]);
    }

    /**
     * Store new device session.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        $sessionId = 'device_' . Str::lower(Str::random(8));

        $device = Device::create([
            'name' => $validated['name'],
            'session_id' => $sessionId,
            'branch_id' => $validated['branch_id'] ?? null,
            'status' => 'disconnected',
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Perangkat WhatsApp baru berhasil ditambahkan.');
    }

    /**
     * Delete device session.
     */
    public function destroy(Device $device)
    {
        $device->delete();
        return redirect()->back()->with('success', 'Perangkat WhatsApp berhasil dihapus.');
    }
}
