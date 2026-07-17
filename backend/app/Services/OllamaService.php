<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class OllamaService
{
    public function analizar(string $prompt)
    {
        $response = Http::post(
            env('OLLAMA_URL').'/api/chat',
            [
                'model' => env('OLLAMA_MODEL'),
                'messages' =>[
                    [
                        'role' => 'system',
                        'content'=>'Eres un experto en triage hospitalario. Utiliza Unicamente el protocolo proporcionado'
                    ],
                    [
                        'role'=>'user',
                        'content'=>$prompt
                    ]
                ],
                'stream'=>false
            ]
        );

        if(!$response->successful()){
            throw new \Exception(
                'Ollama error: '.$response->body()
            );
        }
        return $response -> json()['message']['content'];

    }
}