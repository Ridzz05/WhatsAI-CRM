<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Lead;
use App\Services\OpenWaService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    /**
     * Display list of generated invoices.
     */
    public function index()
    {
        $invoices = Invoice::with('lead')->orderBy('created_at', 'desc')->get();
        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
        ]);
    }

    /**
     * Generate payment link & QRIS for a lead.
     */
    public function generate(Request $request)
    {
        $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'amount' => 'required|numeric|min:1000',
            'description' => 'nullable|string',
            'send_wa' => 'nullable|boolean',
        ]);

        $lead = Lead::findOrFail($request->lead_id);
        $invNumber = 'INV-' . strtoupper(Str::random(6)) . '-' . date('Ymd');
        
        // Mock dynamic QRIS payment URL
        $paymentUrl = url("/pay/{$invNumber}");
        $qrisUrl = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" . urlencode($paymentUrl);

        $invoice = Invoice::create([
            'lead_id' => $lead->id,
            'invoice_number' => $invNumber,
            'amount' => $request->amount,
            'payment_status' => 'pending',
            'payment_method' => 'QRIS',
            'payment_url' => $paymentUrl,
            'qris_url' => $qrisUrl,
        ]);

        // Send payment link to customer via WA if requested
        if ($request->send_wa) {
            $formattedAmount = "Rp " . number_format($request->amount, 0, ',', '.');
            $msg = "Halo Kak {$lead->name}! Berikut invoice transaksi Anda:\n\n"
                 . "📄 *No Invoice:* {$invNumber}\n"
                 . "💰 *Total Pembayaran:* {$formattedAmount}\n"
                 . "📌 *Link Pembayaran Instant:* {$paymentUrl}\n\n"
                 . "Silakan klik link di atas atau scan QRIS untuk menyelesaikan pembayaran. Terima kasih!";
            
            OpenWaService::sendMessage($lead->phone, $msg);
        }

        return response()->json([
            'success' => true,
            'invoice' => $invoice->load('lead'),
            'message' => 'Link pembayaran & QRIS berhasil dibuat.',
        ]);
    }
}
