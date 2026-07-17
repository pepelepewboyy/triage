<?php
use App\Services\OllamaService;
use App\Services\ObsidianService;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PacienteController;
use App\Http\Controllers\TriageController;
use App\Http\Controllers\PersonaController;
use App\Http\Controllers\IAController;

use Illuminate\Support\Facades\Route;

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

Route::get('/personas', [PersonaController::class, 'index']);

Route::get('/personas/{id}', [PersonaController::class, 'show']);

Route::post('/personas', [PersonaController::class, 'store']);

Route::put('/personas/{id}', [PersonaController::class, 'update']);

Route::delete('/personas/{id}', [PersonaController::class, 'destroy']);

Route::post('/ia/clasificar',[IAController::class, 'clasificar']);
