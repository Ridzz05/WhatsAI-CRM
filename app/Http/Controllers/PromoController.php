<?php

namespace App\Http\Controllers;

use App\Models\Promo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PromoController extends Controller
{
    /**
     * Display a listing of promos.
     */
    public function index()
    {
        $promos = Promo::orderBy('created_at', 'desc')->get();
        return Inertia::render('Promos/Index', [
            'promos' => $promos
        ]);
    }

    /**
     * Store a newly created promo.
     */
    public function store(Request $request)
    {
        $request->validate([
            'promo_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'bonus' => 'nullable|string|max:255',
            'valid_until' => 'nullable|date',
            'terms' => 'nullable|string',
        ]);

        Promo::create([
            'promo_name' => $request->promo_name,
            'description' => $request->description,
            'price' => $request->price,
            'bonus' => $request->bonus,
            'valid_until' => $request->valid_until,
            'terms' => $request->terms,
            'is_active' => true,
        ]);

        return redirect()->route('promos.index')->with('success', 'Promo berhasil disimpan.');
    }

    /**
     * Update the specified promo.
     */
    public function update(Request $request, Promo $promo)
    {
        $request->validate([
            'promo_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'bonus' => 'nullable|string|max:255',
            'valid_until' => 'nullable|date',
            'terms' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);

        $promo->update($request->all());

        return redirect()->route('promos.index')->with('success', 'Promo berhasil diperbarui.');
    }

    /**
     * Remove the specified promo from storage.
     */
    public function destroy(Promo $promo)
    {
        $promo->delete();
        return redirect()->route('promos.index')->with('success', 'Promo berhasil dihapus.');
    }
}
