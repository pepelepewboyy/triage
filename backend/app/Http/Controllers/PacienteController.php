<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PacienteController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | INSERTAR PACIENTE
    |--------------------------------------------------------------------------
    */
    public function store(Request $request)
    {
        try {


            $id = DB::table('pacientes')
                ->insertGetId([

                    'nombre_completo' =>
                        $request->nombre_completo,

                    'fecha_nacimiento' =>
                        $request->fecha_nacimiento,

                    'edad_estimada' =>
                        $request->edad_estimada,

                    'edad_estimada' =>
                        $request->edad_estimada,

                    'sexo' =>
                        $request->sexo,

                    'nss' =>
                        $request->nss,

                    'tipo_sangre' =>
                        $request->tipo_sangre,

                    'donador_organos' =>
                        $request->donador_organos,

                    'estado' => 'Activo'
                ]);

            return response()->json([
                'success' => true,
                'id_paciente' => $id
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
    | LISTAR PACIENTES (con su triage más reciente)
    |--------------------------------------------------------------------------
    */
    public function index()
    {
        // Último triage activo por paciente (evita filas duplicadas si
        // un paciente tiene varios registros de triage).
        $ultimoTriage = DB::table('triage')
            ->select('fk_paciente', DB::raw('MAX(id_triage) as id_triage'))
            ->where('estado', 'Activo')
            ->groupBy('fk_paciente');

        return DB::table('pacientes as p')
            ->joinSub($ultimoTriage, 'ut', function ($join) {
                $join->on('ut.fk_paciente', '=', 'p.id_paciente');
            })
            ->join('triage as t', 't.id_triage', '=', 'ut.id_triage')
            ->join('niveles_triage as n', 'n.id_nivel', '=', 't.fk_nivel')
            ->join('metodos_triage as m', 'm.id_metodo', '=', 't.fk_metodo')
            ->select(
                't.id_triage',
                'p.id_paciente',
                'p.nombre_completo',
                'p.edad_estimada',
                'p.sexo',

                'm.codigo as metodo_codigo',
                'm.nombre as metodo',

                'n.color as prioridad',
                'n.nombre as nivel',

                't.sintomas',
                't.estado',
                't.habitacion',
                't.fecha_triage'
            )
            ->where('p.estado', 'Activo')
            ->orderBy('n.orden_prioridad')
            ->orderBy('t.fecha_triage')
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | OBTENER PACIENTE (paciente + triage más reciente + detalle del método)
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {
        $paciente = DB::table('pacientes')
            ->where('id_paciente', $id)
            ->first();

        if (!$paciente) {
            return response()->json([
                'success' => false,
                'message' => 'Paciente no encontrado'
            ], 404);
        }

        $triage = DB::table('triage as t')
            ->join('niveles_triage as n', 'n.id_nivel', '=', 't.fk_nivel')
            ->join('metodos_triage as m', 'm.id_metodo', '=', 't.fk_metodo')
            ->select(
                't.id_triage',
                't.fk_metodo',
                't.fk_nivel',
                't.sintomas',
                't.comentarios',
                't.habitacion',
                't.estado',
                't.fecha_triage',
                'm.codigo as metodo_codigo',
                'm.nombre as metodo_nombre',
                'n.nombre as nivel_nombre',
                'n.color'
            )
            ->where('t.fk_paciente', $id)
            ->where('t.estado', 'Activo')
            ->orderByDesc('t.fecha_triage')
            ->first();

        // Cada método guarda sus propios criterios/signos vitales en su
        // tabla de detalle; se consulta la que corresponda.
        $detalle = null;

        if ($triage) {
            $detalle = match ($triage->metodo_codigo) {
                'IGU_IMSS' => DB::table('triage_imss')
                    ->where('fk_triage', $triage->id_triage)
                    ->first(),

                'ISSSTE' => DB::table('triage_isste as ti')
                    ->leftJoin('patologias_isste as pa', 'pa.id_patologia', '=', 'ti.fk_patologia')
                    ->select('ti.*', 'pa.nombre as patologia')
                    ->where('ti.fk_triage', $triage->id_triage)
                    ->first(),

                'START_JUMPSTART' => DB::table('triage_start')
                    ->where('fk_triage', $triage->id_triage)
                    ->first(),

                default => null,
            };
        }

        return response()->json([
            'success' => true,
            'paciente' => $paciente,
            'triage' => $triage,
            'detalle' => $detalle,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | ACTUALIZAR PACIENTE
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, $id)
    {
        DB::beginTransaction();

        try {

            // --- Datos básicos del paciente ---
            DB::table('pacientes')
                ->where('id_paciente', $id)
                ->update([
                    'nombre_completo' => $request->nombre_completo,
                    'edad_meses' => $request->edad_meses,
                    'edad_estimada' => $request->edad_estimada ?? 0,
                    'sexo' => $request->sexo,
                    'nss' => $request->nss,
                    'tipo_sangre' => $request->tipo_sangre,
                    'donador_organos' => $request->donador_organos,
                ]);

            $triage = DB::table('triage')
                ->where('id_triage', $request->id_triage)
                ->first();

            if (!$triage) {
                throw new \Exception('Triage no encontrado para este paciente.');
            }

            // --- Cabecera del triage (común a los 3 métodos) ---
            DB::table('triage')
                ->where('id_triage', $triage->id_triage)
                ->update([
                    'fk_nivel' => $request->fk_nivel,
                    'sintomas' => $request->sintomas,
                    'comentarios' => $request->comentarios,
                    'habitacion' => $request->habitacion,
                ]);

            $metodoCodigo = DB::table('metodos_triage')
                ->where('id_metodo', $triage->fk_metodo)
                ->value('codigo');

            // --- Detalle específico según el método del triage ---
            switch ($metodoCodigo) {

                case 'IGU_IMSS':
                    DB::table('triage_imss')
                        ->where('fk_triage', $triage->id_triage)
                        ->update([
                            'requiere_reanimacion' => $request->requiere_reanimacion,
                            'alto_riesgo' => $request->alto_riesgo,
                            'deterioro_neurologico_agudo' => $request->deterioro_neurologico_agudo,
                            'dolor_severo' => $request->dolor_severo,
                            'dificultad_respiratoria_severa' => $request->dificultad_respiratoria_severa,
                            'num_acciones_dx_tx' => $request->num_acciones_dx_tx,
                            'frecuencia_cardiaca' => $request->frecuencia_cardiaca,
                            'frecuencia_respiratoria' => $request->frecuencia_respiratoria,
                            'saturacion_oxigeno' => $request->saturacion_oxigeno,
                            'signos_vitales_en_riesgo' => $request->signos_vitales_en_riesgo,
                        ]);
                    break;

                case 'ISSSTE':
                    DB::table('triage_isste')
                        ->where('fk_triage', $triage->id_triage)
                        ->update([
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
                    DB::table('triage_start')
                        ->where('fk_triage', $triage->id_triage)
                        ->update([
                            'tipo_paciente' => $request->tipo_paciente,
                            'deambula' => $request->deambula,
                            'respira' => $request->respira,
                            'frecuencia_respiratoria' => $request->frecuencia_respiratoria,
                            'perfusion_alterada' => $request->perfusion_alterada,
                            'estado_mental_alterado' => $request->estado_mental_alterado,
                            'ventilaciones_administradas' => $request->ventilaciones_administradas,
                            'intervenciones_criticas' => $request->intervenciones_criticas,
                        ]);
                    break;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Paciente actualizado'
            ]);

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | ELIMINACIÓN LÓGICA
    |--------------------------------------------------------------------------
    */

    public function eliminarPaciente($id)
    {
        try {

            DB::beginTransaction();

            DB::table('triage')
                ->where('fk_paciente', $id)
                ->update([
                    'estado' => 'Inactivo'
                ]);

            DB::table('pacientes')
                ->where('id_paciente', $id)
                ->update([
                    'estado' => 'Inactivo'
                ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Paciente eliminado'
            ]);

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);

        }
    }

    /*
    |--------------------------------------------------------------------------
    | BUSCAR PACIENTE
    |--------------------------------------------------------------------------
    */

    public function buscar($busqueda)
    {
        return DB::table('pacientes')
            ->where('estado', 'Activo')
            ->where(function ($query) use ($busqueda) {
                $query->where('nombre_completo', 'like', "%{$busqueda}%")
                      ->orWhere('nss', 'like', "%{$busqueda}%");
            })
            ->get();
    }
}