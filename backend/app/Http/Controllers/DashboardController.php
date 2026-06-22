<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function pacientesUrgentes()
    {
        $pacientes = DB::table('pacientes as p')
            ->join('triage as t', 'p.id_paciente', '=', 't.fk_paciente')
            ->select(
                'p.id_paciente',
                'p.nombre_completo',
                'p.edad',
                't.sintomas',
                't.comentarios'
            )
            ->where('t.nivel_evaluacion', 'ROJO')
            ->where('t.estado', 'ACTIVO')
            ->get();

        return response()->json($pacientes);
    }
}