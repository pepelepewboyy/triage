import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../services/api";
import "../css/style-dash.css";
import logo from "../assets/estrella-vida.png";
import Sidebar from "../components/Sidebar";


function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

  const [pacienteEditando, setPacienteEditando] = useState({
    id_paciente: "",
    id_triage: "",
    nombre_completo: "",
    edad: "",
    sexo: "",
    tipo_sangre: "",
    nivel_evaluacion: "",
    sintomas: "",
    frecuencia_cardiaca: "",
    presion_arterial: "",
    temperatura: "",
    habitacion: "",
  });
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const navigate = useNavigate();
  const cargarPacientes = async () => {
    try {
      const response = await api.get("/pacientes");

      setPacientes(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  const pacientesFiltrados = pacientes.filter((p) =>
    p.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()),
  );

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

    localStorage.removeItem("usuario");
    localStorage.removeItem("id_persona");

    navigate("/");
  };

  const verPaciente = (id) => {
    localStorage.setItem("idPaciente", id);
    navigate(`/seguimiento/${id}`);
  };

  const editarPaciente = async (id) => {
    try {
      const response = await api.get(`/pacientes/${id}`);

      const paciente = response.data;
      setPacienteEditando({
        ...paciente,
      });

      setMostrarModal(true);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error al editar al paciente",
      });
      console.error(error);
    }
  };
  const guardarCambios = async () => {
    try {
      console.log("ENVIANDO...");
      console.log(pacienteEditando);

      await api.put(
        `/pacientes/${pacienteEditando.id_paciente}`,
        pacienteEditando,
      );

      alert("Paciente actualizado");

      setMostrarModal(false);

      cargarPacientes();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error al guardar cambios",
      });
      console.error(error);

      console.log(error.response?.data);
    }
  };
  const mostrarEliminar = async (idPaciente, idTriage) => {
    const result = await Swal.fire({
      title: "¿Qué deseas eliminar?",
      text: "Selecciona una opción",
      icon: "warning",

      showDenyButton: true,
      showCancelButton: true,

      confirmButtonText: "Solo triage",
      denyButtonText: "Paciente completo",
      cancelButtonText: "Cancelar",

      confirmButtonColor: "#f39c12",
      denyButtonColor: "#e74c3c",
    });

    try {
      if (result.isConfirmed) {
        await api.put(`/triage/${idTriage}/eliminar`);

        Swal.fire("Eliminado", "El triage fue eliminado", "success");//porque esta en ingles succes?

        cargarPacientes();
      }

      if (result.isDenied) {
        const confirmar = await Swal.fire({
          title: "¿Eliminar paciente?",
          text: "También se eliminarán todos sus triages.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#e74c3c",
        });

        if (!confirmar.isConfirmed) return;

        await api.put(`/pacientes/${idPaciente}/eliminar`);

        Swal.fire("Eliminado", "Paciente eliminado", "success");//igual aqui

        cargarPacientes();
      }
    } catch (error) {
      console.error(error);

      Swal.fire("Error", "No fue posible eliminar", "error");
    }
  };
  const handleChange = (e) => {
    setPacienteEditando({
      ...pacienteEditando,
      [e.target.name]: e.target.value,
    });
  };

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

        {/* CONTENIDO */}
        <div className="main">
          <div className="topbar">
            <h3>Pacientes</h3>

            <div>Hola! {usuario?.nombre}</div>
          </div>

          <div className="table-container" style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
              }}
            >
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="txt"
                style={{
                  maxWidth: "300px",
                  padding: "10px",
                }}
              />

              <Link to="/triaje" className="view">
                <i className="fa-solid fa-plus"></i>
              </Link>
            </div>
            <div className="tab-con">
              <table>
                <thead>
                  <tr>
                    <th>ID Triage</th>
                    <th>ID Paciente</th>
                    <th>Nombre</th>
                    <th>Edad</th>
                    <th>Sexo</th>
                    <th>Nivel</th>
                    <th>Síntomas</th>
                    <th>Habitación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {pacientesFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        style={{
                          textAlign: "center",
                        }}
                      >
                        No hay pacientes
                      </td>
                    </tr>
                  ) : (
                    pacientesFiltrados.map((paciente) => (
                      <tr key={paciente.id_triage}>
                        <td>{paciente.id_triage}</td>

                        <td>{paciente.id_paciente}</td>

                        <td>{paciente.nombre_completo}</td>

                        <td>{paciente.edad}</td>

                        <td>{paciente.sexo}</td>

                        <td>{paciente.nivel_evaluacion}</td>

                        <td>{paciente.sintomas}</td>

                        <td>{paciente.habitacion}</td>

                        <td className="acciones">
                          <div className="acciones-contenedor">
                            <button
                              className="view"
                              onClick={() =>
                                editarPaciente(paciente.id_paciente)
                              }
                            >
                              <i
                                className="fa-solid fa-pencil"
                                style={{
                                  color: "#4116db",
                                }}
                              />
                            </button>

                            <button
                              className="view"
                              onClick={() => verPaciente(paciente.id_paciente)}
                            >
                              <i
                                className="fa-solid fa-eye"
                                style={{
                                  color: "#0a8076",
                                }}
                              />
                            </button>

                            <button
                              className="view"
                              onClick={() =>
                                mostrarEliminar(
                                  paciente.id_paciente,
                                  paciente.id_triage,
                                )
                              }
                            >
                              <i
                                className="fa-solid fa-trash"
                                style={{
                                  color: "#db1616",
                                }}
                              />
                            </button>
                          </div>
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
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                <i className="fa-solid fa-notes-medical"></i> Detalles del
                paciente
              </h2>

              <div className="btnClose" onClick={() => setMostrarModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </div>
            </div>

            <form className="modal-form">
              <div className="section-title">Información personal</div>

              <div className="full">
                <label>Nombre completo</label>

                <input
                  type="text"
                  name="nombre_completo"
                  value={pacienteEditando.nombre_completo || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Edad</label>

                <input
                  type="text"
                  name="edad"
                  value={pacienteEditando.edad || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Sexo</label>

                <select
                  name="sexo"
                  value={pacienteEditando.sexo || ""}
                  onChange={handleChange}
                >
                  <option value="Masculino">Masculino</option>

                  <option value="Femenino">Femenino</option>
                </select>
              </div>

              <div>
                <label>Número de seguro social</label>

                <input
                  type="text"
                  name="nss"
                  value={pacienteEditando.nss || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Tipo de sangre</label>

                <select
                  name="tipo_sangre"
                  value={pacienteEditando.tipo_sangre || ""}
                  onChange={handleChange}
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
              </div>

              <div>
                <label>¿Es donador?</label>

                <select
                  name="donador_organos"
                  value={pacienteEditando.donador_organos || ""}
                  onChange={handleChange}
                >
                  <option value="SI">SI</option>
                  <option value="NO">NO</option>
                </select>
              </div>

              <div className="section-title">Signos vitales y triage</div>

              <div>
                <label>Nivel de urgencia</label>

                <select
                  name="nivel_evaluacion"
                  value={pacienteEditando.nivel_evaluacion || ""}
                  onChange={handleChange}
                >
                  <option>ROJO</option>
                  <option>NARANJA</option>
                  <option>AMARILLO</option>
                  <option>VERDE</option>
                  <option>AZUL</option>
                </select>
              </div>

              <div>
                <label>Temperatura</label>

                <input
                  type="text"
                  name="temperatura"
                  value={pacienteEditando.temperatura || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Presión arterial</label>

                <input
                  type="text"
                  name="presion_arterial"
                  value={pacienteEditando.presion_arterial || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Frecuencia cardíaca</label>

                <input
                  type="text"
                  name="frecuencia_cardiaca"
                  value={pacienteEditando.frecuencia_cardiaca || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Habitación</label>

                <input
                  type="text"
                  name="habitacion"
                  value={pacienteEditando.habitacion || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="full">
                <label>Síntomas / Historia clínica</label>

                <textarea
                  name="sintomas"
                  value={pacienteEditando.sintomas || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="full btn_guardar">
                <button type="button" onClick={guardarCambios}>
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Pacientes;
