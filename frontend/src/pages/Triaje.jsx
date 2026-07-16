import { useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import "../css/styles-triage.css";

const INSTITUCIONES = [
  { key: "IMSS", label: "IMSS" },
  { key: "ISSSTE", label: "ISSSTE" },
  { key: "Cruz Roja", label: "Cruz Roja / START" },
];


const MAPA_METODOS = {
  IMSS: 1,
  ISSSTE: 2,
  "Cruz Roja": 3,
};

const NIVELES_POR_METODO = {
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

const CAMPOS_POR_INSTITUCION = {
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


function construirDatosMetodo(institucion, datos) {
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

export default function Triage() {
  const [tipoPaciente, setTipoPaciente] = useState("existente");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [paciente, setPaciente] = useState({
    id_paciente:"",
    nombre_completo: "",
    fecha_nacimiento: "",
    edad_estimada: "",
    sexo: "Masculino",
    nss: "",
    tipo_sangre: "DESCONOCIDO",
    donador_organos: "NO",
  });

  const [buscarPaciente, setBuscarPaciente] = useState("");
  const [resultados, setResultados] = useState([]);
  const [idPaciente, setIdPaciente] = useState("");

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const [institucion, setInstitucion] = useState("");
  const [datosMetodo, setDatosMetodo] = useState({});

  const [triage, setTriage] = useState({
    sintomas: "",
    nivel_triage: "",
    comentario: "",
  });

  const seleccionarInstitucion = (inst) => {
    setInstitucion(inst);
    setDatosMetodo({});
    // El nivel seleccionado pertenece al método anterior; se limpia para
    // que el usuario no envíe, por ejemplo, un id_nivel de IMSS mientras
    // el fk_metodo ya apunta a ISSSTE.
    setTriage((prev) => ({ ...prev, nivel_triage: "" }));
  };

  const handleCampoChange = (key, value) => {
    setDatosMetodo((prev) => ({ ...prev, [key]: value }));
  };

  const activeIndex = INSTITUCIONES.findIndex((i) => i.key === institucion);

  const insertarPaciente = async () => {
    try {
      if (tipoPaciente === "nuevo") {
        const response = await api.post("/pacientes", {
          nombre_completo: paciente.nombre_completo,
          fecha_nacimiento: paciente.fecha_nacimiento,
          edad_estimada: paciente.edad_estimada,
          sexo: paciente.sexo,
          nss: paciente.nss,
          tipo_sangre: paciente.tipo_sangre,
          donador_organos: paciente.donador_organos,
        });
        Swal.fire({
          title: "Paciente insertado con éxito",
          text:
            "Paciente registrado correctamente con ID " +
            response.data.id_paciente,
          icon: "success",
        });
        console.log(response.data.id_paciente)
        setIdPaciente(response.data.id_paciente);
      } else {
        if (!buscarPaciente.trim()) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Escribe algo para buscar",
          });
          return;
        }
        const response = await api.get(`/pacientes/buscar/${buscarPaciente}`);
        setResultados(response.data);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error al registrar el triage",
      });
    }
  };

  const insertarTriage = async () => {
    if (!institucion) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Selecciona una institución / método",
      });
      return;
    }
    if (!triage.sintomas || !triage.nivel_triage) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Completa todos los campos del triage",
      });
      return;
    }
    if (!idPaciente) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Elige un paciente",
      });
      return;
    }

    try {
      const response = await api.post("/triage", {
        fk_metodo: MAPA_METODOS[institucion],
        fk_nivel: Number(triage.nivel_triage),
        sintomas: triage.sintomas,
        comentarios: triage.comentario,
        id_persona: usuario.id_persona,
        id_paciente: idPaciente,

        ...construirDatosMetodo(institucion, datosMetodo),
      });

      Swal.fire({
        title: "Paciente insertado con éxito",
        text:
          "Triage registrado correctamente con ID " + response.data.id_triage,
        icon: "success",
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      const mensajeBackend =
        error.response?.data?.message || "Error al registrar el triage";

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: mensajeBackend,
      });

      console.error(error.response?.data || error);
    }
  };

  const camposActivos = CAMPOS_POR_INSTITUCION[institucion] || [];
  const nivelesActivos = NIVELES_POR_METODO[institucion] || [];

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <header className="topbar">
          <button
            className="hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="fa-solid fa-bars"></i>
          </button>
          <h3>Triage</h3>
          <div className="user">¡Hola! {usuario?.nombre}</div>
        </header>

        <div className="triage-content">
          {/* PACIENTE */}
          <form id="formPaciente">
            <div className="card">
              <h3>Paciente</h3>

              <div className="tabs">
                <button
                  type="button"
                  className={`tab-btn ${tipoPaciente === "existente" ? "active" : ""}`}
                  onClick={() => setTipoPaciente("existente")}
                >
                  Paciente existente
                </button>
                <button
                  type="button"
                  className={`tab-btn ${tipoPaciente === "nuevo" ? "active" : ""}`}
                  onClick={() => setTipoPaciente("nuevo")}
                >
                  Nuevo paciente
                </button>
              </div>

              {tipoPaciente === "existente" ? (
                <div id="busquedaPaciente">
                  <input
                    type="text"
                    placeholder="Buscar por ID, NSS o nombre"
                    value={buscarPaciente}
                    onChange={(e) => setBuscarPaciente(e.target.value)}
                  />

                  <div id="resultados">
                    {resultados.length === 0 ? (
                      <p className="sin-resultados">No hay resultados</p>
                    ) : (
                      resultados.map((p) => (
                        <div
                          key={p.id_paciente}
                          className={`resultado-item ${idPaciente === p.id_paciente ? "seleccionado" : ""}`}
                          onClick={() => {
                            setIdPaciente(p.id_paciente);
                            Swal.fire({
                              icon: "success",
                              title: "Seleccionaste un paciente",
                              text: `Paciente seleccionado: ${p.id_paciente}`,
                            });
                          }}
                        >
                          <strong>{p.nombre_completo}</strong>
                          <br />
                          NSS: {p.nss}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div id="nuevoPaciente">
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={paciente.nombre_completo}
                    onChange={(e) =>
                      setPaciente({
                        ...paciente,
                        nombre_completo: e.target.value,
                      })
                    }
                  />

                  <input
                    type="date"
                    value={paciente.fecha_nacimiento}
                    onChange={(e) =>
                      setPaciente({
                        ...paciente,
                        fecha_nacimiento: e.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Edad estimada"
                    value={paciente.edad_estimada}
                    onChange={(e) =>
                      setPaciente({
                        ...paciente,
                        edad_estimada: e.target.value,
                      })
                    }
                  />

                  <select
                    value={paciente.sexo}
                    onChange={(e) =>
                      setPaciente({ ...paciente, sexo: e.target.value })
                    }
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>

                  <input
                    type="number"
                    placeholder="NSS"
                    value={paciente.nss}
                    onChange={(e) =>
                      setPaciente({ ...paciente, nss: e.target.value })
                    }
                  />

                  <label className="label-select">Tipo de sangre</label>

                  <select
                    value={paciente.tipo_sangre}
                    onChange={(e) =>
                      setPaciente({ ...paciente, tipo_sangre: e.target.value })
                    }
                  >
                    <option>O+</option>
                    <option>O-</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                    <option>DESCONOCIDO</option>
                  </select>
                  <label className="label-select">Donador de organos</label>

                  <select
                    value={paciente.donador_organos}
                    onChange={(e) =>
                      setPaciente({
                        ...paciente,
                        donador_organos: e.target.value,
                      })
                    }
                  >
                    <option>SI</option>
                    <option>NO</option>
                  </select>
                </div>
              )}

              <button type="button" className="btn" onClick={insertarPaciente}>
                Consultar/Insertar paciente
              </button>
            </div>
          </form>

          {/* TRIAGE */}
          <form id="formTriage">
            {/* Selector de institución */}
            <div className="card institucion-card">
              <h3>Institución / Método de evaluación</h3>

              <div className="slider-toggle">
                <div
                  className="slider-thumb"
                  style={{
                    width: `${100 / INSTITUCIONES.length}%`,
                    transform: `translateX(${activeIndex >= 0 ? activeIndex * 100 : 0}%)`,
                    opacity: activeIndex >= 0 ? 1 : 0,
                  }}
                ></div>

                {INSTITUCIONES.map((inst) => (
                  <button
                    key={inst.key}
                    type="button"
                    className={`slider-option ${institucion === inst.key ? "active" : ""}`}
                    onClick={() => seleccionarInstitucion(inst.key)}
                  >
                    {inst.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Campos dinámicos según institución */}
            {camposActivos.map((campo) => (
              <div className="card" key={campo.key}>
                <h3>{campo.label}</h3>

                {campo.type === "select" ? (
                  <select
                    value={datosMetodo[campo.key] || ""}
                    onChange={(e) =>
                      handleCampoChange(campo.key, e.target.value)
                    }
                  >
                    <option value="">Seleccione</option>
                    {campo.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : campo.type === "textarea" ? (
                  <textarea
                    rows="4"
                    value={datosMetodo[campo.key] || ""}
                    onChange={(e) =>
                      handleCampoChange(campo.key, e.target.value)
                    }
                  />
                ) : (
                  <input
                    type={campo.type}
                    value={datosMetodo[campo.key] || ""}
                    onChange={(e) =>
                      handleCampoChange(campo.key, e.target.value)
                    }
                  />
                )}
              </div>
            ))}
            <div className="card sintomas">
              <h3>Síntomas e historia clínica</h3>
              <textarea
                rows="8"
                value={triage.sintomas}
                onChange={(e) =>
                  setTriage({ ...triage, sintomas: e.target.value })
                }
                required
              />
            </div>

            <div className="card">
              <h3>Comentarios</h3>
              <textarea
                rows="8"
                value={triage.comentario}
                onChange={(e) =>
                  setTriage({ ...triage, comentario: e.target.value })
                }
              />
            </div>

            <div className="card">
              <h3>Nivel de triage</h3>
              <select
                value={triage.nivel_triage}
                onChange={(e) =>
                  setTriage({ ...triage, nivel_triage: e.target.value })
                }
                disabled={!institucion}
              >
                <option value="">
                  {institucion
                    ? "Seleccione nivel"
                    : "Primero selecciona una institución"}
                </option>
                {nivelesActivos.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="card botones">
              <button
                type="button"
                className="btn btn-guardar"
                onClick={insertarTriage}
              >
                <i className="fa-solid fa-floppy-disk"></i>
                Guardar evaluación
              </button>
              <button
                type="button"
                className="btn btn-ia"
                onClick={insertarTriage}
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                IA Evaluación
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
