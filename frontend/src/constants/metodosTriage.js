export const INSTITUCIONES = [
  { key: "IMSS", label: "IMSS" },
  { key: "ISSSTE", label: "ISSSTE" },
  { key: "Cruz Roja", label: "Cruz Roja / START" },
];

export const CAMPOS_POR_INSTITUCION = {
  IMSS: [
    { key: "signos_vitales", label: "Signos vitales", type: "text" },
    { key: "acciones_diagnosticas", label: "Acciones diagnósticas", type: "textarea" },
    { key: "alto_riesgo", label: "¿Alto riesgo?", type: "select", options: ["Sí", "No"] },
    { key: "reanimacion_inmediata", label: "¿Reanimación inmediata?", type: "select", options: ["Sí", "No"] },
  ],
  ISSSTE: [
    { key: "frecuencia_cardiaca", label: "Frecuencia cardíaca", type: "text" },
    { key: "frecuencia_respiratoria", label: "Frecuencia respiratoria", type: "text" },
    { key: "glucosa_capilar", label: "Glucosa capilar", type: "text" },
    { key: "presion_arterial", label: "Presión arterial", type: "text" },
    { key: "saturacion_oxigeno", label: "Saturación de oxígeno", type: "text" },
    { key: "temperatura", label: "Temperatura", type: "text" },
    { key: "escala_glasgow", label: "Escala de Glasgow", type: "text" },
  ],
  "Cruz Roja": [
    { key: "deambulacion", label: "Deambulación", type: "select", options: ["Camina", "No camina"] },
    { key: "respiracion", label: "Respiración", type: "select", options: ["Ausente", "Presente < 30/min", "Presente > 30/min"] },
    { key: "perfusion", label: "Perfusión", type: "select", options: ["Llenado capilar < 2s", "Llenado capilar > 2s / pulso ausente"] },
    { key: "estado_mental", label: "Estado mental", type: "select", options: ["Obedece órdenes", "No obedece órdenes"] },
  ],
};