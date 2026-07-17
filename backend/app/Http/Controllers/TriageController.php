<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use App\Service\OllamaService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TriageController extends Controller
{
        
    /*
    |--------------------------------------------------------------------------
    | INSERTAR TRIAGE
    |--------------------------------------------------------------------------
    */
    public function store(Request $request)
    {
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

        $validator = Validator::make($request->all(), [
            'id_paciente' => 'required|integer|exists:pacientes,id_paciente',
            'id_persona'  => 'required|integer|exists:persona,id_persona',
            'fk_metodo'   => 'required|integer|exists:metodos_triage,id_metodo',
            'fk_nivel'    => 'nullable|integer|exists:niveles_triage,id_nivel',
            'sintomas'    => 'required|string|max:150',
            'comentarios' => 'nullable|string|max:150',
            'habitacion'  => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        $metodoCodigo = DB::table('metodos_triage')
            ->where('id_metodo', $request->fk_metodo)
            ->value('codigo');

        if (!$metodoCodigo) {
            return response()->json([
                'success' => false,
                'message' => 'Método de triage no válido'
            ], 422);
        }

        try {

            $idTriage = DB::transaction(function () use ($request, $metodoCodigo) {

                $idTriage = DB::table('triage')->insertGetId([
                    'fk_paciente' => $request->id_paciente,
                    'fk_persona'  => $request->id_persona,
                    'fk_metodo'   => $request->fk_metodo,
                    'fk_nivel'    => $request->fk_nivel,
                    'sintomas'    => $request->sintomas,
                    'comentarios' => $request->comentarios,
                    'habitacion'  => $request->habitacion,
                    'estado'      => 'Activo',
                ]);

                switch ($metodoCodigo) {

                    case 'IGU_IMSS':
                        DB::table('triage_imss')->insert([
                            'fk_triage' => $idTriage,
                            'requiere_reanimacion' => $request->requiere_reanimacion ?? 0,
                            'alto_riesgo' => $request->alto_riesgo ?? 0,
                            'deterioro_neurologico_agudo' => $request->deterioro_neurologico_agudo ?? 0,
                            'dolor_severo' => $request->dolor_severo ?? 0,
                            'dificultad_respiratoria_severa' => $request->dificultad_respiratoria_severa ?? 0,
                            'num_acciones_dx_tx' => $request->num_acciones_dx_tx,
                            'frecuencia_cardiaca' => $request->frecuencia_cardiaca,
                            'frecuencia_respiratoria' => $request->frecuencia_respiratoria,
                            'saturacion_oxigeno' => $request->saturacion_oxigeno,
                            'signos_vitales_en_riesgo' => $request->signos_vitales_en_riesgo,
                        ]);
                        break;

                    case 'ISSSTE':
                        DB::table('triage_isste')->insert([
                            'fk_triage' => $idTriage,
                            'glasgow' => $request->glasgow,
                            'presion_sistolica' => $request->presion_sistolica,
                            'presion_diastolica' => $request->presion_diastolica,
                            'frecuencia_cardiaca' => $request->frecuencia_cardiaca,
                            'frecuencia_respiratoria' => $request->frecuencia_respiratoria,
                            'temperatura' => $request->temperatura,
                            'saturacion_oxigeno' => $request->saturacion_oxigeno,
                            'glucosa_capilar' => $request->glucosa_capilar,
                            'fk_patologia' => $request->fk_patologia,
                        ]);
                        break;

                    case 'START_JUMPSTART':
                        DB::table('triage_start')->insert([
                            'fk_triage' => $idTriage,
                            'tipo_paciente' => $request->tipo_paciente ?? 'Adulto',
                            'deambula' => $request->deambula,
                            'respira' => $request->respira,
                            'frecuencia_respiratoria' => $request->frecuencia_respiratoria,
                            'perfusion_alterada' => $request->perfusion_alterada,
                            'estado_mental_alterado' => $request->estado_mental_alterado,
                            'ventilaciones_administradas' => $request->ventilaciones_administradas ?? 0,
                            'intervenciones_criticas' => $request->intervenciones_criticas,
                        ]);
                        break;
                }

                return $idTriage;
            });

            return response()->json([
                'success' => true,
                'id_triage' => $idTriage
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