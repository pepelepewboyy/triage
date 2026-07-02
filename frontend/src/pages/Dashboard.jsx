import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../services/api";
import logo from "../assets/estrella-vida.png";
import "../css/style-dash.css";

function Dashboard() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [pacientes, setPacientes] = useState([]);

  const cargarPacientes = async () => {
    try {
      const response = await api.get("/dashboard/pacientes-urgentes");

      setPacientes(response.data);
    } catch (error) {
      console.error("Error cargando pacientes:", error);
    }
  };
  const cerrarSesion = async () => {
    const result = await Swal.fire({
      title: "Cerrar sesión",
      text: "¿Deseas salir del sistema?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      localStorage.clear();

      navigate("/");
    }
  };

  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));

    if (!usuarioGuardado) {
      navigate("/");
      return;
    }

    setUsuario(usuarioGuardado);

    // Aquí después cargaremos los pacientes desde Laravel
    cargarPacientes();
  }, [navigate]);

  const verPaciente = (id) => {
    localStorage.setItem("idPaciente", id);
    navigate(`/seguimiento/${id}`);
  };

  if (!usuario) {
    return <h2>Cargando...</h2>;
  }

  return (
    <div className="dashboard-container">
      {/* SIDE BAR */}
      <div className="sidebar">
        <div className="logo">
          <img src={logo} alt="TrIAge" />
        </div>

        <div className="menu">
          <Link to="/dashboard" className="active">
            <i className="fa-solid fa-house"></i>
            Dashboard
          </Link>

          <Link to="/pacientes">
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
        <div className="topbar">
          <h3>Dashboard</h3>

          <div className="user">Hola! {usuario.nombre}</div>
        </div>

        <div className="table-container">
          <h3>Pacientes urgentes</h3>

          <table id="usuariosTabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Edad</th>
                <th>Síntomas</th>
                <th>Comentarios</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {pacientes.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                    }}
                  >
                    No hay pacientes
                  </td>
                </tr>
              ) : (
                pacientes.map((paciente) => (
                  <tr key={paciente.id_paciente}>
                    <td>{paciente.id_paciente}</td>
                    <td>{paciente.nombre_completo}</td>
                    <td>{paciente.edad}</td>
                    <td>{paciente.sintomas}</td>
                    <td>{paciente.comentarios}</td>
                    <td>
                      <button
                        className="view"
                        onClick={() => verPaciente(paciente.id_paciente)}
                      >
                        <i
                          className="fa-solid fa-eye"
                          style={{ color: "#16DBCC" }}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
