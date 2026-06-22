<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PersonaController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | LISTAR USUARIOS
    |--------------------------------------------------------------------------
    */
    public function index()
    {
        $usuarios = DB::table('persona')
            ->where('estado', 'Activo')
            ->orderBy('nombre')
            ->get();

        return response()->json($usuarios);
    }

    /*
    |--------------------------------------------------------------------------
    | OBTENER USUARIO POR ID
    |--------------------------------------------------------------------------
    */
    public function show($id)
    {
        $usuario = DB::table('persona')
            ->where('id_persona', $id)
            ->first();

        if (!$usuario) {
            return response()->json([
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        return response()->json($usuario);
    }

    /*
    |--------------------------------------------------------------------------
    | AGREGAR USUARIO
    |--------------------------------------------------------------------------
    */
    public function store(Request $request)
    {
        $id = DB::table('persona')->insertGetId([
            'nombre'     => $request->nombre,
            'apellidos'  => $request->apellidos,
            'rol'        => $request->rol,
            'usuario'    => $request->usuario,
            'password'   => bcrypt($request->password),
            'estado'     => 'Activo'
        ]);

        return response()->json([
            'message' => 'Usuario agregado correctamente',
            'id_persona' => $id
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | ACTUALIZAR USUARIO
    |--------------------------------------------------------------------------

    */
    public function update(Request $request, $id)
    {
        $datos = [
            'nombre'    => $request->nombre,
            'apellidos' => $request->apellidos,
            'rol'       => $request->rol,
            'usuario'   => $request->usuario,
        ];

        if (!empty($request->password)) {
            $datos['password'] = bcrypt($request->password);
        }

        DB::table('persona')
            ->where('id_persona', $id)
            ->update($datos);

        return response()->json([
            'message' => 'Usuario actualizado correctamente'
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | ELIMINACIÓN LÓGICA
    |--------------------------------------------------------------------------
    */
    public function destroy($id)
    {
        DB::table('persona')
            ->where('id_persona', $id)
            ->update([
                'estado' => 'Inactivo'
            ]);

        return response()->json([
            'message' => 'Usuario eliminado correctamente'
        ]);
    }
}