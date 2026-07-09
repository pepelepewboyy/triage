import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../services/api";
import fotoPerfil from "../assets/fto_pac.jpg";
import "../css/styles-seg.css";
import Sidebar from "../components/Sidebar";

function Seguimiento() {
  const [paciente, setPaciente] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem("idPaciente");

    if (id) {
      cargarPaciente(id);
    }
  }, []);

  const cargarPaciente = async (id) => {
    try {
      const response = await api.get(`/pacientes/${id}`);
      setPaciente(response.data);
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

  if (!paciente) {
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
            <h4>Edad: {paciente.edad}</h4>
            <h4>Folio: {paciente.id_paciente}</h4>

            <hr />

            <h5>Síntomas:</h5>
            <p className="texto">{paciente.sintomas}</p>

            <h5>Comentarios:</h5>
            <p className="texto chiquito">{paciente.comentarios}</p>
          </div>

          <div className="detalles">
            <div className="triage-info">
              <h4>Detalles de triage</h4>

              <div className="fila">
                <span>Nivel de riesgo:</span>
                <span className="atendido">{paciente.nivel_evaluacion}</span>
              </div>

              <div className="fila">
                <span>Estado:</span>
                <span className="nvl-ries">{paciente.estado}</span>
              </div>

              <div className="fila">
                <span>Habitación:</span>
                <span className="hab">{paciente.habitacion}</span>
              </div>

              <hr />
              <h4>Signos vitales:</h4>
              <div className="fila">
                <span>Frecuencia cardiaca:</span>
                <span className="Frecuencia">{paciente.frecuencia_cardiaca} bpm</span>
              </div>
              <div className="fila">
                <span>Presión arterial:</span>
                <span className="Presion">{paciente.presion_arterial} mmHg</span>
              </div>
              <div className="fila">
                <span>Temperatura:</span>
                <span className="Temperatura">{paciente.temperatura}°C</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Seguimiento;