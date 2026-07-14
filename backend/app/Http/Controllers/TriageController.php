<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use App\Service\OllamaService;
use Illuminate\Support\Facades\DB;

class TriageController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | CLASIFICACIÓN TRIAGE - OLLAMA
    |--------------------------------------------------------------------------
    
    public function clasificarTriage(
        Request $request,
        OllamaService $ollama
    )
    {
        $prompt = "
        Actúa como un especialista en triage.

        Edad: {$edad}
        Sexo: {$sexo}
        Temperatura: {$temperatura}
        FC: {$fc}
        FR: {$fr}
        Saturación: {$saturacion}

        Síntomas:
        {$sintomas}

        Clasifica al paciente en:
        Rojo, Naranja, Amarillo, Verde o Azul.

        Responde únicamente JSON:

        {
            \"clasificacion\": \"\",
            \"justificacion\": \"\"
        }
        ";
        $resultado = $ollama->analizar($prompt);

        return response()->json($resultado);


    }*/
        
    /*
    |--------------------------------------------------------------------------
    | INSERTAR TRIAGE
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        try {
            $triageActivo = DB::table('triage')
                ->where('fk_paciente', $request->id_paciente)
                ->where('estado', 'Activo')
                ->exists();
            if ($triageActivo) {
                return response()->json([
                    'success' => false,
                    'message' => 'El paciente ya tiene un triage activo'
                ], 409);
            }

            $id = DB::table('triage')->insertGetId([
                'sintomas' => $request->sintomas,
                'metodo_evaluacion' => $request->metodo,
                'nivel_evaluacion' => strtoupper($request->nivel),
                'comentarios' => $request->comentario,
                'frecuencia_cardiaca' => $request->frecuencia,
                'presion_arterial' => $request->presion,
                'temperatura' => $request->temperatura,
                'fk_persona' => $request->id_persona,
                'fk_paciente' => $request->id_paciente,
                'estado' => 'Activo'
            ]);

            return response()->json([
                'success' => true,
                'id_triage' => $id
            ], 201);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);

        }
    }

    /*
    |--------------------------------------------------------------------------
    | ELIMINAR TRIAGE
    |--------------------------------------------------------------------------
    */
    public function eliminarTriage($id)
    {
        try {

            DB::table('triage')
                ->where('id_triage', $id)
                ->update([
                    'estado' => 'Inactivo'
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Triage eliminado'
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);

        }
    }
}