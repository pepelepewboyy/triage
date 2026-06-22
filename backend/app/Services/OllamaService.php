<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class OllamaService
{
    public function analizar($prompt)
    {
        $response = Http::withoutVerifying()
            ->withToken(env('OLLAMA_API_KEY'))
            ->post('https://ollama.com/api/chat', [
                'model' => env('OLLAMA_MODEL'),
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'stream' => false
            ]);
        
        return $response -> json();

    }
}