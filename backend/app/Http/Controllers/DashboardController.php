<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function pacientesUrgentes()
    {
        $pacientes = DB::table('triage as t')
            ->join('pacientes as p', 't.fk_paciente', '=', 'p.id_paciente')
            ->join('niveles_triage as n', 't.fk_nivel', '=', 'n.id_nivel')
            ->join('metodos_triage as m', 't.fk_metodo', '=', 'm.id_metodo')
            ->select(
                't.id_triage as id',
                'n.color as color',
                'p.nombre_completo as nombre_completo',
                'p.edad_meses as edad_meses',
                'p.edad_estimada as edad_estimada',
                'm.nombre as metodo',
                't.sintomas as motivo',
                't.fecha_triage as ingreso',
                't.estado as estado'
            )
            ->where('n.color', 'ROJO')
            ->where('t.estado', 'Activo')
            ->where('p.estado', 'Activo')
            ->orderBy('t.fecha_triage')
            ->get()
            ->map(function ($item) {

                // Edad en años a partir de edad_meses; si no hay dato, null
                $item->edad = $item->edad_meses !== null
                    ? intdiv($item->edad_meses, 12)
                    : null;

                unset($item->edad_meses);

                // Tiempo de espera desde que se registró el triage
                $ingreso = Carbon::parse($item->ingreso);

                $item->espera = $ingreso->diffForHumans([
                    'parts' => 2,
                    'short' => true,
                    'syntax' => Carbon::DIFF_RELATIVE_TO_NOW,
                ]);

                return $item;
            });

        return response()->json($pacientes);
    }
}