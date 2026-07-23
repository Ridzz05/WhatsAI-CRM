<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BranchController extends Controller
{
    /**
     * Display list of gym/business branches.
     */
    public function index()
    {
        $branches = Branch::withCount(['products', 'leads'])->orderBy('created_at', 'desc')->get();
        return Inertia::render('Branches/Index', [
            'branches' => $branches,
        ]);
    }

    /**
     * Store new branch.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:branches,code',
            'city' => 'required|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
        ]);

        Branch::create($validated);

        return redirect()->back()->with('success', 'Cabang baru berhasil ditambahkan.');
    }
}
