<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'usuario' => 'required',
            'password' => 'required'
        ]);

        $usuario = DB::table('persona')
            ->select(
                'id_persona',
                'nombre',
                'apellidos',
                'rol',
                'usuario',
                'password',
                'estado'
            )
            ->where('usuario', $request->usuario)
            ->where('estado', 'Activo')
            ->first();

        if (!$usuario) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario o contraseña incorrectos'
            ], 401);
        }

        if (!Hash::check($request->password, $usuario->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario o contraseña incorrectos'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'usuario' => [
                'id' => $usuario->id_persona,
                'nombre' => $usuario->nombre,
                'apellidos' => $usuario->apellidos,
                'usuario' => $usuario->usuario,
                'rol' => $usuario->rol
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Sesión cerrada'
        ]);
    }
}