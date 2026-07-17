<?php

    namespace App\Services;

    class ObsidianService
    {   

        private string $vaultPath;
        public function __construct(){
            $this->vaultPath = env('OBSIDIAN_PATH');
        }

        public function obtenerContexto( string $tipo):string
        {
            $ruta = $this -> obtenerRutaProtocolo($tipo);
            return $this ->leerCarpeta($ruta);
        }

        private function obtenerRutaProtocolo(string $tipo): string
        {
            $protocolos = [
                "IMSS"    => $this->vaultPath . DIRECTORY_SEPARATOR . "IMSS",
                "ISSSTE"  => $this->vaultPath . DIRECTORY_SEPARATOR . "ISSSTE",
                "START"   => $this->vaultPath . DIRECTORY_SEPARATOR . "START",
            ];

            if (!array_key_exists($tipo, $protocolos)) {
                throw new \Exception("Protocolo '{$tipo}' no encontrado.");
            }

            if (!is_dir($protocolos[$tipo])) {
                throw new \Exception("La carpeta del protocolo no existe.");
            }

            return $protocolos[$tipo];
        }
        private function leerCarpeta(string $ruta): string
        {
            $contexto = "";

            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator(
                    $ruta,
                    \FilesystemIterator::SKIP_DOTS
                )
            );

            foreach ($iterator as $archivo) {

                if (!$archivo->isFile()) {
                    continue;
                }

                if (strtolower($archivo->getExtension()) !== "md") {
                    continue;
                }

                $contenido = file_get_contents($archivo->getRealPath());

                $contexto .= "\n\n";
                $contexto .= "==================================================\n";
                $contexto .= "DOCUMENTO: " . $archivo->getFilename() . "\n";
                $contexto .= "==================================================\n\n";
                $contexto .= $contenido;
                $contexto .= "\n";
            }

            return trim($contexto);
        }

    }