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
    | LISTAR PACIENTES
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
    | OBTENER PACIENTE 
    |--------------------------------------------------------------------------
    */

    private const METODO_CODIGO_A_INSTITUCION = [
        'IGU_IMSS' => 'IMSS',
        'ISSSTE' => 'ISSSTE',
        'START_JUMPSTART' => 'Cruz Roja',
    ];

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
        $institucion = null;
        $datosMetodo = null;
 
        if ($triage) {
            $institucion = self::METODO_CODIGO_A_INSTITUCION[$triage->metodo_codigo] ?? null;
 
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
 
            if ($detalle) {
                $datosMetodo = $this->reconstruirDatosMetodo($triage->metodo_codigo, $detalle);
            }
        }
 
        return response()->json([
            'success' => true,
            'paciente' => $paciente,
            'triage' => $triage,
            'detalle' => $detalle,
            // Listos para usar tal cual en el frontend: setInstitucion(institucion)
            // y setDatosMetodo(datos_metodo) prellenan el formulario de edición
            // con las mismas llaves que espera CAMPOS_POR_INSTITUCION.
            'institucion' => $institucion,
            'datos_metodo' => $datosMetodo,
        ]);
    }
 

    private function reconstruirDatosMetodo(string $metodoCodigo, object $detalle): array
    {
        switch ($metodoCodigo) {
 
            case 'IGU_IMSS':
                $numAcciones = match ($detalle->num_acciones_dx_tx) {
                    'Ninguna' => '0',
                    'Una' => '1',
                    'Varias' => 'Varias',
                    default => '',
                };
 
                return [
                    'reanimacion_inmediata' => $detalle->requiere_reanimacion ? 'Sí' : 'No',
                    'alto_riesgo' => $detalle->alto_riesgo ? 'Sí' : 'No',
                    'acciones_diagnosticas' => $numAcciones,
                    'frecuencia_cardiaca' => $detalle->frecuencia_cardiaca,
                    'frecuencia_respiratoria' => $detalle->frecuencia_respiratoria,
                    'saturacion_oxigeno' => $detalle->saturacion_oxigeno,
                ];
 
            case 'ISSSTE':
                $presion = null;
                if ($detalle->presion_sistolica !== null && $detalle->presion_diastolica !== null) {
                    $presion = $detalle->presion_sistolica . '/' . $detalle->presion_diastolica;
                }
 
                return [
                    'escala_glasgow' => $detalle->glasgow,
                    'presion_arterial' => $presion,
                    'frecuencia_cardiaca' => $detalle->frecuencia_cardiaca,
                    'frecuencia_respiratoria' => $detalle->frecuencia_respiratoria,
                    'temperatura' => $detalle->temperatura,
                    'saturacion_oxigeno' => $detalle->saturacion_oxigeno,
                    'glucosa_capilar' => $detalle->glucosa_capilar,
                ];
 
            case 'START_JUMPSTART':
                // "respiracion" en la UI distingue 3 estados, pero la BD
                // solo guarda respira (bool) + frecuencia_respiratoria.
                // Se reconstruye con el mejor esfuerzo: sin respira = Ausente;
                // con respira, se usa la FR para decidir < o > 30/min.
                if (!$detalle->respira) {
                    $respiracion = 'Ausente';
                } elseif ($detalle->frecuencia_respiratoria !== null && $detalle->frecuencia_respiratoria > 30) {
                    $respiracion = 'Presente > 30/min';
                } else {
                    $respiracion = 'Presente < 30/min';
                }
 
                return [
                    'deambulacion' => $detalle->deambula ? 'Camina' : 'No camina',
                    'respiracion' => $respiracion,
                    'frecuencia_respiratoria' => $detalle->frecuencia_respiratoria,
                    'perfusion' => $detalle->perfusion_alterada
                        ? 'Llenado capilar > 2s / pulso ausente'
                        : 'Llenado capilar < 2s',
                    'estado_mental' => $detalle->estado_mental_alterado
                        ? 'No obedece órdenes'
                        : 'Obedece órdenes',
                ];
 
            default:
                return [];
        }
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
                      ->orWhere('nss', 'like', "%{$busqueda}%")
                      ->orWhere('id_paciente','like',"%{$busqueda}%");
            })
            ->get();
    }
}