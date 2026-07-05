import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import "../css/style-dash.css";

function Dashboard() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [pacientes, setPacientes] = useState([]);
const [sidebarOpen, setSidebarOpen] = useState(true); // visible por defecto

  const cargarPacientes = async () => {
    try {
      const response = await api.get("/dashboard/pacientes-urgentes");
      setPacientes(response.data);
    } catch (error) {
      console.error("Error cargando pacientes:", error);
    }
  };

  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    if (!usuarioGuardado) {
      navigate("/");
      return;
    }
    setUsuario(usuarioGuardado);
    cargarPacientes();
  }, [navigate]);

  const verPaciente = (id) => {
    localStorage.setItem("idPaciente", id);
    navigate(`/seguimiento/${id}`);
  };

  if (!usuario) return <h2>Cargando...</h2>;

  return (
    <div className="dashboard-container">
<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
  <div className="main">
    <div className="topbar">
      <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <i className="fa-solid fa-bars"></i>
      </button>
      <h3>Dashboard</h3>
      <div className="user">¡Hola! {usuario.nombre}</div>
    </div>
    {/* resto igual */}

        <div className="table-container">
          <h3>Pacientes urgentes</h3>
          <div className="tab-con">
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
                    <td colSpan="6" style={{ textAlign: "center" }}>No hay pacientes</td>
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
                        <button className="view" onClick={() => verPaciente(paciente.id_paciente)}>
                          <i className="fa-solid fa-eye" style={{ color: "#16DBCC" }} />
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
    </div>
  );
}

export default Dashboard;