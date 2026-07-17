import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../services/api";
import fotoPerfil from "../assets/fto_pac.jpg";
import "../css/styles-seg.css";
import Sidebar from "../components/Sidebar";

function Seguimiento() {
  const [paciente, setPaciente] = useState(null);
  const [triage, setTriage] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem("idPaciente");

    if (id) {
      cargarPaciente(id);
    }
  }, []);

  const cargarPaciente = async (id) => {
    setDetalle(null);
    setTriage(null);
    setPaciente(null);
    try {
      const response = await api.get(`/pacientes/${id}`);
      setPaciente(response.data.paciente);
      setTriage(response.data.triage);
      setDetalle(response.data.detalle);

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error al cargar el paciente",
      });
      console.error("Error al cargar paciente:", error);
      navigate("/pacientes");
    }
  };

  const mostrarEdad = () => {
    if (paciente.fecha_nacimiento) {
      const nacimiento = new Date(paciente.fecha_nacimiento);
      const hoy = new Date();
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const noHaCumplidoAnios =
        hoy.getMonth() < nacimiento.getMonth() ||
        (hoy.getMonth() === nacimiento.getMonth() &&
          hoy.getDate() < nacimiento.getDate());
      if (noHaCumplidoAnios) edad--;
      return `${edad} años`;
    }
    return paciente.edad_estimada || "Desconocida";
  };

  if (!paciente || !triage) {
    return (
      <div className="dashboard-container">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main">
          <h3>Cargando información...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <header className="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className="fa-solid fa-bars"></i>
          </button>
          <h3>Seguimiento</h3>
          <div className="user">Hola! {localStorage.getItem("nombre")}</div>
        </header>

        <div className="content">
          <div className="perfil">
            <div className="foto">
              <img src={fotoPerfil} alt="Paciente" />
            </div>

            <h4>{paciente.nombre_completo}</h4>
            <h4>Edad: {mostrarEdad()}</h4>
            <h4>Folio: {paciente.id_paciente}</h4>

            <hr />

            <h5>Síntomas:</h5>
            <p className="texto">{triage.sintomas}</p>

            <h5>Comentarios:</h5>
            <p className="texto chiquito">{triage.comentarios}</p>
          </div>

          <div className="detalles">
            <div className="triage-info">
              <h4>Detalles de triage</h4>

              <div className="fila">
                <span>Método:</span>
                <span>{triage.metodo_nombre}</span>
                </div>

              <div className="fila">
                <span>Nivel de riesgo:</span>
                <span className="atendido">{triage.nivel_nombre}</span>
              </div>

              <div className="fila">
                <span>Estado:</span>
                <span className="nvl-ries">{triage.estado}</span>
              </div>

              <div className="fila">
                <span>Habitación:</span>
                <span className="hab">{triage.habitacion || "HABITACIÓN NO ASIGNADA"}</span>
              </div>

              <hr />
              <h4>Signos vitales:</h4>
               {triage.metodo_codigo === "IGU_IMSS" && detalle && (
                <>
                  <div className="fila">
                    <span>Frecuencia cardiaca:</span>
                    <span className="Frecuencia">
                      {detalle.frecuencia_cardiaca ?? "N/A"} bpm
                    </span>
                  </div>
                  <div className="fila">
                    <span>Frecuencia respiratoria:</span>
                    <span>{detalle.frecuencia_respiratoria ?? "N/A"} rpm</span>
                  </div>
                  <div className="fila">
                    <span>Saturación de oxígeno:</span>
                    <span>{detalle.saturacion_oxigeno ?? "N/A"}%</span>
                  </div>
                </>
              )}
 
              {triage.metodo_codigo === "ISSSTE" && detalle && (
                <>
                  <div className="fila">
                    <span>Glasgow:</span>
                    <span>{detalle.glasgow ?? "N/A"}</span>
                  </div>
                  <div className="fila">
                    <span>Frecuencia cardiaca:</span>
                    <span className="Frecuencia">
                      {detalle.frecuencia_cardiaca ?? "N/A"} bpm
                    </span>
                  </div>
                  <div className="fila">
                    <span>Frecuencia respiratoria:</span>
                    <span>{detalle.frecuencia_respiratoria ?? "N/A"} rpm</span>
                  </div>
                  <div className="fila">
                    <span>Presión arterial:</span>
                    <span className="Presion">
                      {detalle.presion_sistolica ?? "N/A"}/
                      {detalle.presion_diastolica ?? "N/A"} mmHg
                    </span>
                  </div>
                  <div className="fila">
                    <span>Temperatura:</span>
                    <span className="Temperatura">
                      {detalle.temperatura ?? "N/A"}°C
                    </span>
                  </div>
                  <div className="fila">
                    <span>Saturación de oxígeno:</span>
                    <span>{detalle.saturacion_oxigeno ?? "N/A"}%</span>
                  </div>
                  <div className="fila">
                    <span>Glucosa capilar:</span>
                    <span>{detalle.glucosa_capilar ?? "N/A"} mg/dL</span>
                  </div>
                  {detalle.patologia && (
                    <div className="fila">
                      <span>Patología sugerente:</span>
                      <span>{detalle.patologia}</span>
                    </div>
                  )}
                </>
              )}
 
              {triage.metodo_codigo === "START_JUMPSTART" && detalle && (
                <>
                  <div className="fila">
                    <span>Tipo de paciente:</span>
                    <span>{detalle.tipo_paciente}</span>
                  </div>
                  <div className="fila">
                    <span>Deambula:</span>
                    <span>{detalle.deambula ? "Sí" : "No"}</span>
                  </div>
                  <div className="fila">
                    <span>Respira:</span>
                    <span>{detalle.respira ? "Sí" : "No"}</span>
                  </div>
                  <div className="fila">
                    <span>Frecuencia respiratoria:</span>
                    <span>{detalle.frecuencia_respiratoria ?? "N/A"} rpm</span>
                  </div>
                  <div className="fila">
                    <span>Perfusión alterada:</span>
                    <span>{detalle.perfusion_alterada ? "Sí" : "No"}</span>
                  </div>
                  <div className="fila">
                    <span>Estado mental alterado:</span>
                    <span>{detalle.estado_mental_alterado ? "Sí" : "No"}</span>
                  </div>
                  {detalle.intervenciones_criticas && (
                    <div className="fila">
                      <span>Intervenciones críticas:</span>
                      <span>{detalle.intervenciones_criticas}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Seguimiento;