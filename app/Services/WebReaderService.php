<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class WebReaderService
{
    /**
     * Fetch, clean, and cache the text content of a public website URL for AI knowledge injection.
     */
    public static function getContent($url)
    {
        if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) {
            return '';
        }

        $cacheKey = 'web_reader_content_' . md5($url);

        // Cache the scraped website text content for 12 hours to prevent slow chat replies
        return Cache::remember($cacheKey, 43200, function () use ($url) {
            try {
                // Use public Jina Reader API to get clean markdown formatting for the LLM
                $jinaUrl = 'https://r.jina.ai/' . $url;
                $response = Http::withoutVerifying()->timeout(10)->get($jinaUrl);

                if ($response->successful()) {
                    $text = $response->body();

                    // Remove excessive whitespaces and linebreaks to conserve AI tokens
                    $text = preg_replace('/\s+/', ' ', $text);
                    $text = trim($text);

                    // Limit the character length to avoid prompt bloat (max 4000 characters)
                    return substr($text, 0, 4000);
                }

                Log::warning("WebReaderService: Failed to fetch via Jina Reader [{$jinaUrl}]. Status: " . $response->status());
            } catch (\Exception $e) {
                Log::warning("WebReaderService: Connection error for Jina Reader [{$url}]. Message: " . $e->getMessage());
            }

            return ''; // Graceful fallback
        });
    }

    /**
     * Force clear the cached content for a specific URL to refresh the AI knowledge base.
     */
    public static function clearCache($url)
    {
        if (!empty($url)) {
            Cache::forget('web_reader_content_' . md5($url));
        }
    }
}
