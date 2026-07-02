<?php

namespace App\Http\Controllers;

use App\Models\Persona;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            $request->validate([
                'usuario' => 'required',
                'password' => 'required'
            ]);

            $persona = Persona::where('usuario', $request->usuario)
                ->where('estado', 'Activo')
                ->first();

            if (!$persona) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario o contraseña incorrectos'
                ], 401);
            }

            if (!password_verify($request->password, $persona->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario o contraseña incorrectos'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'usuario' => [
                    'id_persona' => $persona->id_persona,
                    'nombre' => $persona->nombre,
                    'apellidos' => $persona->apellidos,
                    'usuario' => $persona->usuario,
                    'rol' => $persona->rol
                ]
            ]);
        } catch (\Exception $e) {
    return response()->json([
        'error' => $e->getMessage()
    ], 500);
}

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