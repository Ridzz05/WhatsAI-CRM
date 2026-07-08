<?php

use App\Services\GeminiService;

it('returns correct fallback response for Palembang Square general inquiries', function () {
    $history = [
        ['sender' => 'user', 'message' => 'infokan Loyal Fitness Prime Palembang Square dong']
    ];
    $response = GeminiService::generateResponse(null, $history);
    
    expect($response)->toContain('Betul kak, Loyal Fitness Prime akan hadir di Palembang Square');
});

it('returns correct fallback response for Palembang Square facilities inquiries', function () {
    $history = [
        ['sender' => 'user', 'message' => 'apa saja fasilitas di Loyal Fitness Prime Palembang Square?']
    ];
    $response = GeminiService::generateResponse(null, $history);
    
    expect($response)->toContain('Fasilitasnya akan dibuat lebih lengkap kak');
});

it('returns correct fallback response for Palembang Square pricing inquiries', function () {
    $history = [
        ['sender' => 'user', 'message' => 'berapa harga presale di Palembang Square?']
    ];
    $response = GeminiService::generateResponse(null, $history);
    
    expect($response)->toContain('Untuk harga presales sedang dibuka dengan harga khusus');
});

it('returns correct fallback response for Palembang Square opening inquiries', function () {
    $history = [
        ['sender' => 'user', 'message' => 'kapan buka Loyal Fitness Prime Palembang Square?']
    ];
    $response = GeminiService::generateResponse(null, $history);
    
    expect($response)->toContain('Target paling lama 1 Oktober 2026 kak');
});

it('returns correct fallback response for Palembang Square IP comparison inquiries', function () {
    $history = [
        ['sender' => 'user', 'message' => 'apa bedanya Loyal Fitness Prime PS dengan Loyal Fitness IP?']
    ];
    $response = GeminiService::generateResponse(null, $history);
    
    expect($response)->toContain('Loyal Fitness Prime Palembang Square akan dibuat lebih lengkap dan lebih premium dari Loyal Fitness IP kak');
});
