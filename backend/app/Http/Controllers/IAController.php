<?php

    namespace App\Http\Controllers;

    use Illuminate\Http\Request;
    use App\Services\ObsidianService;
    use App\Services\OllamaService;

    class IAController extends Controller{
        protected ObsidianService $obsidian;
        protected OllamaService $ollama;

        public function __construct(
            ObsidianService $obsidian,
            OllamaService $ollama
        ) {
            $this->obsidian = $obsidian;
            $this->ollama = $ollama;
        }

        public function clasificar(Request $request)
        {
            try {

                // Obtener el contexto desde Obsidian
                $contexto = $this->obsidian->obtenerContexto(strtoupper($request->tipo));
                //Se genera el prompt a base de lo obtenido
                $prompt = $this->crearPrompt($contexto, $request->except('tipo'));
                // Consultar Ollama
                $respuesta = $this->ollama->analizar($prompt);
                return response()->json($respuesta);

            } catch (\Exception $e) {

                return response()->json([
                    "success" => false,
                    "message" => $e->getMessage()
                ], 500);
                }
            }

        private function crearPrompt(string $contexto, array $paciente): string
        {
            return "
                Eres un sistema experto en triage hospitalario.

                Debes utilizar EXCLUSIVAMENTE la información del protocolo proporcionado.

                =========================
                PROTOCOLO
                =========================

                $contexto

                =========================
                PACIENTE
                =========================

                {$this -> construirDatosPaciente($paciente)}

                =========================
                No inventes criterios que no aparezcan en el protocolo.

                Clasifica al paciente.

                Devuelve ÚNICAMENTE un JSON válido (comillas dobles, sin comas
                finales) con exactamente esta estructura:
                {
                    \"success\": true,
                    \"nivel_triage\": \"\",
                    \"prioridad\": \"\",
                    \"justificacion\": \"\"
                }

                No agregues texto antes ni después del json. No uses bloques
                de código (```). Responde solo el objeto JSON.
                ";
        }
        private function construirDatosPaciente(array $paciente): string{
            $texto="";

            foreach ($paciente as $campo =>$valor){
            $texto.= ucfirst($campo). ":{$valor}\n";
            }
            return $texto;
        }
}