<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PacienteController;
use App\Http\Controllers\TriageController;
use App\Services\OllamaService;
use App\Http\Controllers\PersonaController;

Route::post('/login', [AuthController::class, 'login']);

Route::post('/logout', [AuthController::class, 'logout']);

Route::get('/dashboard/pacientes-urgentes',[DashboardController::class, 'pacientesUrgentes']);

Route::get('/pacientes', [PacienteController::class, 'index']);

Route::get('/pacientes/{id}', [PacienteController::class, 'show']);

Route::put('/pacientes/{id}', [PacienteController::class, 'update']);

Route::get('/pacientes/buscar/{busqueda}',[PacienteController::class, 'buscar']);

Route::put('/pacientes/{id}/eliminar',[PacienteController::class, 'eliminarPaciente']);

Route::post('/pacientes',[PacienteController::class, 'store']);

Route::put('/triage/{id}/eliminar',[TriageController::class, 'eliminarTriage']);

Route::post('/triage',[TriageController::class, 'store']);

Route::get('/test-ollama', function (OllamaService $ollama) {

    $resultado = $ollama->analizar(
        "Eres un asistente especializado en clasificación de triage médico.

        Debes analizar únicamente la información proporcionada.

        No inventes síntomas, antecedentes, diagnósticos o signos vitales que no aparezcan en los datos.
        No menciones nuevamente los sintomas en la justificación, en caso de que necesites decirlos solo dí 'Los sintomas...'

        Datos del paciente:

        Frecuencia cardiaca: 45 lpm

        Presión arterial: 90/60 mmHg

        Temperatura: 35.5 °C

        Síntomas e historia clínica:
        Paciente masculino de 23 años con hipotermia, dificultad para respirar, dolor torácico y debilidad generalizada.

        Comentarios:
        El paciente refiere empeoramiento progresivo durante las últimas horas.

        Método de evaluación:
        START

        Instrucciones:

        1. Analiza únicamente los datos proporcionados.
        2. Aplica el método de evaluación indicado.
        3. Determina la clasificación de triage sugerida de acuerdo a los colores del método brindado.
        4. Explica la razón de la clasificación .
        5. Responde únicamente en formato JSON válido.

        Respuesta esperada:

        {
        'clasificacion_sugerida': '',
        'justificacion': '',
        }"
    );

    return $resultado['message']['content'];
});

Route::get('/personas', [PersonaController::class, 'index']);

Route::get('/personas/{id}', [PersonaController::class, 'show']);

Route::post('/personas', [PersonaController::class, 'store']);

Route::put('/personas/{id}', [PersonaController::class, 'update']);

Route::delete('/personas/{id}', [PersonaController::class, 'destroy']);