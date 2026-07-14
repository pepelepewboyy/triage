<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class PersonaController extends Controller
{
    // Roles válidos según el ENUM de la tabla `persona`
    private const ROLES_VALIDOS = ['Medico(a)', 'Paramedico(a)', 'Enfermero(a)', 'Admin'];

    /*
    |--------------------------------------------------------------------------
    | LISTAR USUARIOS
    |--------------------------------------------------------------------------
    */
    public function index()
    {
        $usuarios = DB::table('persona')
            ->select('id_persona', 'nombre', 'apellidos', 'rol', 'usuario', 'estado', 'fecha_creacion')
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
            ->select('id_persona', 'nombre', 'apellidos', 'rol', 'usuario', 'estado', 'fecha_creacion')
            ->where('id_persona', $id)
            ->first();

        if (!$usuario) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'usuario' => $usuario
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | AGREGAR USUARIO
    |--------------------------------------------------------------------------
    */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:50',
            'apellidos' => 'required|string|max:50',
            'rol' => 'required|in:' . implode(',', self::ROLES_VALIDOS),
            'usuario' => 'required|string|max:30|unique:persona,usuario',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {

            $id = DB::table('persona')->insertGetId([
                'nombre' => $request->nombre,
                'apellidos' => $request->apellidos,
                'rol' => $request->rol,
                'usuario' => $request->usuario,
                'password' => Hash::make($request->password, ['rounds' => 12]),
                'estado' => 'Activo'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Usuario agregado correctamente',
                'id_persona' => $id
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
    | ACTUALIZAR USUARIO
    |--------------------------------------------------------------------------
    */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:50',
            'apellidos' => 'required|string|max:50',
            'rol' => 'required|in:' . implode(',', self::ROLES_VALIDOS),
            'usuario' => 'required|string|max:30|unique:persona,usuario,' . $id . ',id_persona',
            'password' => 'nullable|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {

            $datos = [
                'nombre' => $request->nombre,
                'apellidos' => $request->apellidos,
                'rol' => $request->rol,
                'usuario' => $request->usuario,
            ];

            if (!empty($request->password)) {
                $datos['password'] = Hash::make($request->password, ['rounds' => 12]);
            }

            $actualizado = DB::table('persona')
                ->where('id_persona', $id)
                ->update($datos);

            if (!$actualizado) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado o sin cambios'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Usuario actualizado correctamente'
            ]);

        } catch (\Exception $e) {

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
    public function destroy($id)
    {
        try {

            DB::table('persona')
                ->where('id_persona', $id)
                ->update([
                    'estado' => 'Inactivo'
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Usuario eliminado correctamente'
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}