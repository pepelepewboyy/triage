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

                'edad' =>
                    $request->edad,

                'sexo' =>
                    $request->sexo,

                'nss' =>
                    $request->nss,

                'tipo_sangre' =>
                    $request->tipo_sangre,

                'donador_organos' =>
                    $request->donador_organos ?? 'NO',

                'fk_contacto' => 1,
                'fk_hospital' => 1,

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
        return DB::table('triage as t')
            ->join(
                'pacientes as p',
                't.fk_paciente',
                '=',
                'p.id_paciente'
            )
            ->select(
                't.id_triage',
                'p.id_paciente',
                'p.nombre_completo',
                'p.edad',
                'p.sexo',
                'p.tipo_sangre',
                'p.donador_organos',
                'p.nss',
                't.estado',
                't.sintomas',
                't.metodo_evaluacion',
                't.nivel_evaluacion',
                't.comentarios',
                't.frecuencia_cardiaca',
                't.presion_arterial',
                't.temperatura',
                't.habitacion',
                't.fk_persona'
            )
            ->where('t.estado', 'Activo')
            ->where('p.estado', 'Activo')
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | OBTENER PACIENTE
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {
        $paciente = DB::table('pacientes as p')
            ->join(
                'triage as t',
                'p.id_paciente',
                '=',
                't.fk_paciente'
            )
            ->join(
                'contactoemergencia as c',
                'c.id_contacto',
                '=',
                'p.fk_contacto'
            )
            ->select(
                'p.id_paciente',
                'p.nombre_completo',
                'p.edad',
                'p.tipo_sangre',
                'p.donador_organos',
                'p.sexo',
                'p.nss',
                't.id_triage',
                't.nivel_evaluacion',
                't.comentarios',
                't.sintomas',
                't.estado',
                't.frecuencia_cardiaca',
                't.presion_arterial',
                't.temperatura',
                't.habitacion',
                'c.nombre_completo as nombreContacto',
                'c.parentesco',
                'c.contacto'
            )
            ->where('p.id_paciente', $id)
            ->first();

        return response()->json($paciente);
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

            DB::table('pacientes')
                ->where(
                    'id_paciente',
                    $id
                )
            ->update([
                'nombre_completo' => $request->nombre_completo,
                'edad' => $request->edad,
                'sexo' => $request->sexo,
                'nss' => $request->nss,
                'tipo_sangre' => $request->tipo_sangre,
                'donador_organos' => $request->donador_organos
            ]);
            DB::table('triage')
                ->where(
                    'id_triage',
                    $request->id_triage
                )
                ->update([
                    'nivel_evaluacion' =>
                        $request->nivel_evaluacion,

                    'sintomas' =>
                        $request->sintomas,

                    'frecuencia_cardiaca' =>
                        $request->frecuencia_cardiaca,

                    'presion_arterial' =>
                        $request->presion_arterial,

                    'temperatura' =>
                        $request->temperatura,

                    'habitacion' =>
                        $request->habitacion
                ]);

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
            ->where(
                'nombre_completo',
                'like',
                "%{$busqueda}%"
            )
            ->orWhere(
                'nss',
                'like',
                "%{$busqueda}%"
            )
            ->get();
    }
}