<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Persona extends Model
{
    protected $table = 'persona';

    protected $primaryKey = 'id_persona';

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'apellidos',
        'rol',
        'usuario',
        'correo',
        'password',
        'estado'
    ];

    protected $hidden = [
        'password'
    ];
}