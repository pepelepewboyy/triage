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
                'p.id_paciente as id',
                'n.color as color',
                'p.nombre_completo as nombre_completo',
                'p.fecha_nacimiento as fecha_nacimiento',
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
 
                // Si hay fecha de nacimiento, se calcula la edad exacta.
                if (!empty($item->fecha_nacimiento)) {
                    $item->edad = Carbon::parse($item->fecha_nacimiento)->age;
                } else {
                    $item->edad = null;
                }
 
                unset($item->fecha_nacimiento);
 
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