export const INSTITUCIONES = [
  { key: "IMSS", label: "IMSS" },
  { key: "ISSSTE", label: "ISSSTE" },
  { key: "Cruz Roja", label: "Cruz Roja / START" },
];

export const MAPA_METODOS = {
  IMSS: 1,
  ISSSTE: 2,
  "Cruz Roja": 3,
};

export const PROTOCOLO_IA_POR_INSTITUCION = {
  IMSS: "IMSS",
  ISSSTE: "ISSSTE",
  "Cruz Roja": "START",
};

export const NIVELES_POR_METODO = {
  IMSS: [
    { id: 1, label: "Nivel 1 - Rojo" },
    { id: 2, label: "Nivel 2 - Naranja" },
    { id: 3, label: "Nivel 3 - Amarillo" },
    { id: 4, label: "Nivel 4 - Verde" },
    { id: 5, label: "Nivel 5 - Azul" },
  ],
  ISSSTE: [
    { id: 6, label: "Prioridad I - Rojo" },
    { id: 7, label: "Prioridad II - Amarillo" },
    { id: 8, label: "Prioridad III - Verde" },
  ],
  "Cruz Roja": [
    { id: 9, label: "Inmediato (Rojo)" },
    { id: 10, label: "Diferido (Amarillo)" },
    { id: 11, label: "Menor (Verde)" },
    { id: 12, label: "Fallecido / Expectante (Negro)" },
  ],
};

export const CAMPOS_POR_INSTITUCION = {
  IMSS: [
    {
      key: "reanimacion_inmediata",
      label: "¿Reanimación inmediata?",
      type: "select",
      options: ["Sí", "No"],
    },
    {
      key: "alto_riesgo",
      label:
        "¿Alto riesgo, deterioro neurológico agudo o dificultad respiratoria severa?",
      type: "select",
      options: ["Sí", "No"],
    },
    {
      key: "acciones_diagnosticas",
      label: "Acciones diagnósticas",
      type: "select",
      options: ["0", "1", "Varias"],
    },
    { key: "frecuencia_cardiaca", label: "Frecuencia cardiaca", type: "text" },
    {
      key: "frecuencia_respiratoria",
      label: "Frecuencia respiratoria",
      type: "text",
    },
    { key: "saturacion_oxigeno", label: "Saturación de oxigeno", type: "text" },
  ],
  ISSSTE: [
    { key: "frecuencia_cardiaca", label: "Frecuencia cardíaca", type: "text" },
    {
      key: "frecuencia_respiratoria",
      label: "Frecuencia respiratoria",
      type: "text",
    },
    { key: "escala_glasgow", label: "Escala de Glasgow", type: "text" },
    { key: "glucosa_capilar", label: "Glucosa capilar", type: "text" },
    {
      key: "presion_arterial",
      label: "Presión arterial (formato: sistólica/diastólica, ej. 120/80)",
      type: "text",
    },
    { key: "saturacion_oxigeno", label: "Saturación de oxígeno", type: "text" },
    { key: "temperatura", label: "Temperatura", type: "text" },
  ],
  "Cruz Roja": [
    {
      key: "deambulacion",
      label: "Deambulación",
      type: "select",
      options: ["Camina", "No camina"],
    },
    {
      key: "respiracion",
      label: "Respiración",
      type: "select",
      options: ["Ausente", "Presente < 30/min", "Presente > 30/min"],
    },
    {
      key: "frecuencia_respiratoria",
      label: "Frecuencia respiratoria",
      type: "number",
    },
    {
      key: "perfusion",
      label: "Perfusión",
      type: "select",
      options: ["Llenado capilar < 2s", "Llenado capilar > 2s / pulso ausente"],
    },
    {
      key: "estado_mental",
      label: "Estado mental",
      type: "select",
      options: ["Obedece órdenes", "No obedece órdenes"],
    },
  ],
};

export function construirDatosMetodo(institucion, datos) {
  switch (institucion) {
    case "IMSS": {
      let numAcciones = null;
      if (datos.acciones_diagnosticas === "0") numAcciones = "Ninguna";
      else if (datos.acciones_diagnosticas === "1") numAcciones = "Una";
      else if (datos.acciones_diagnosticas === "Varias") numAcciones = "Varias";
 
      return {
        requiere_reanimacion: datos.reanimacion_inmediata === "Sí" ? 1 : 0,
        alto_riesgo: datos.alto_riesgo === "Sí" ? 1 : 0,
        deterioro_neurologico_agudo: 0,
        dolor_severo: 0,
        dificultad_respiratoria_severa: 0,
        num_acciones_dx_tx: numAcciones,
        frecuencia_cardiaca: datos.frecuencia_cardiaca || null,
        frecuencia_respiratoria: datos.frecuencia_respiratoria || null,
        saturacion_oxigeno: datos.saturacion_oxigeno || null,
      };
    }
 
    case "ISSSTE": {
      const partes = (datos.presion_arterial || "").split("/");
      const sistolica = partes[0]?.trim() || null;
      const diastolica = partes[1]?.trim() || null;
 
      return {
        glasgow: datos.escala_glasgow || null,
        presion_sistolica: sistolica,
        presion_diastolica: diastolica,
        frecuencia_cardiaca: datos.frecuencia_cardiaca || null,
        frecuencia_respiratoria: datos.frecuencia_respiratoria || null,
        temperatura: datos.temperatura || null,
        saturacion_oxigeno: datos.saturacion_oxigeno || null,
        glucosa_capilar: datos.glucosa_capilar || null,
      };
    }
 
    case "Cruz Roja": {
      return {
        tipo_paciente: "Adulto",
        deambula: datos.deambulacion === "Camina" ? 1 : 0,
        respira: datos.respiracion === "Ausente" ? 0 : 1,
        frecuencia_respiratoria: datos.frecuencia_respiratoria || null,
        perfusion_alterada:
          datos.perfusion === "Llenado capilar > 2s / pulso ausente" ? 1 : 0,
        estado_mental_alterado:
          datos.estado_mental === "No obedece órdenes" ? 1 : 0,
      };
    }
 
    default:
      return {};
  }
}
 
