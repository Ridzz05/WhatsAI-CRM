<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    /**
     * Display product catalog list page.
     */
    public function index()
    {
        $products = Product::with('branch')->orderBy('created_at', 'desc')->get();
        $branches = Branch::where('is_active', true)->get();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'branches' => $branches,
        ]);
    }

    /**
     * Store new product in catalog.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'branch_id' => 'nullable|exists:branches,id',
            'sku' => 'nullable|string|max:100',
            'category' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image_url' => 'nullable|url',
        ]);

        Product::create($validated);
        Cache::forget('crm_active_products');

        return redirect()->back()->with('success', 'Produk baru berhasil ditambahkan ke katalog.');
    }

    /**
     * Update product details.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'branch_id' => 'nullable|exists:branches,id',
            'category' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'is_active' => 'required|boolean',
        ]);

        $product->update($validated);
        Cache::forget('crm_active_products');

        return redirect()->back()->with('success', 'Data produk berhasil diperbarui.');
    }

    /**
     * Delete product from catalog.
     */
    public function destroy(Product $product)
    {
        $product->delete();
        Cache::forget('crm_active_products');

        return redirect()->back()->with('success', 'Produk berhasil dihapus dari katalog.');
    }
}
