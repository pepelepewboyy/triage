import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../services/api";
import logo from "../assets/estrella-vida.png";
import fotoPerfil from "../assets/fto_pac.jpg";
import "../css/styles-seg.css";
import Sidebar from "../components/Sidebar";


function Seguimiento() {
  const [paciente, setPaciente] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem("idPaciente");

    if (id) {
      cargarPaciente(id);
    }
  }, []);
  const cerrarSesion = async () => {
    const result = await Swal.fire({
      title: "Cerrar sesión",
      text: "¿Deseas salir del sistema?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    localStorage.clear();
    navigate("/");
  };
  const cargarPaciente = async (id) => {
    try {
      const response = await api.get(`/pacientes/${id}`);

      setPaciente(response.data);
    } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Error al cargar el paciente"
        });
      

      
      console.error("Error al cargar paciente:", error);
      navigate("/pacientes")
    }
  };

  if (!paciente) {
    return (
      <div className="main">
        <h3>Cargando información...</h3>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-container">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="logo">
            <img src={logo} alt="TrIAge" />
          </div>

          <div className="menu">
            <Link to="/dashboard">
              <i className="fa-solid fa-house"></i>
              Dashboard
            </Link>

            <Link to="/pacientes" className="active">
              <i className="fa-solid fa-user"></i>
              Pacientes
            </Link>

            <Link to="/triaje">
              <i className="fa-solid fa-notes-medical"></i>
              Triaje
            </Link>

            <Link to="/configuraciones">
              <i className="fa-solid fa-gear"></i>
              Configuraciones
            </Link>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                cerrarSesion();
              }}
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              Cerrar sesión
            </a>
          </div>
        </div>

        <div className="main">
          <header className="topbar">
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
                  <span className="Frecuencia">
                    {paciente.frecuencia_cardiaca} bpm
                  </span>
                </div>
                <div className="fila">
                  <span>Presión arterial:</span>
                  <span className="Presion">
                    {paciente.presion_arterial} mmHg
                  </span>
                </div>
                <div className="fila">
                  <span>Temperatura:</span>
                  <span className="Temperatura">{paciente.temperatura}°C</span>
                </div>
                <p> </p>

                <p> </p>

                <p> </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Seguimiento;
