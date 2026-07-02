import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../services/api";
import logo from "../assets/estrella-vida.png";
import "../css/styles-config.css";

export default function Configuraciones() {
  const [usuarios, setUsuarios] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [usuarioEdit, setUsuarioEdit] = useState({
    id_persona: "",
    nombre: "",
    apellidos: "",
    rol: "",
    usuario: "",
    password: "",
  });

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    apellidos: "",
    rol: "",
    usuario: "",
    password: "",
  });
  const navigate = useNavigate();
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
  const cargarUsuarios = async () => {
    try {
      const response = await api.get("/personas");
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error:", error.response?.status, error.response?.data);
    }
  };

  const abrirEditar = (usuario) => {
    setUsuarioEdit(usuario);
    setShowEditModal(true);
  };

  const guardarEdicion = async () => {
    try {
      await api.put(`/personas/${usuarioEdit.id_persona}`, {
        nombre: usuarioEdit.nombre,
        apellidos: usuarioEdit.apellidos,
        rol: usuarioEdit.rol,
        usuario: usuarioEdit.usuario,
        password: usuarioEdit.password,
      });
      setShowEditModal(false);
      await Swal.fire({
        icon: "success",
        title: "Usuario actualizado",
        text: "Los cambios se guardaron correctamente",
        timer: 1500,
        showConfirmButton: false,
      });
      cargarUsuarios();
    } catch (error) {
      console.error(error.response?.data);
      setShowEditModal(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No fue posible actualizar el usuario",
      });
    }
  };

  const agregarUsuario = async () => {
    try {
      await api.post("/personas", {
        nombre: nuevoUsuario.nombre,
        apellidos: nuevoUsuario.apellidos,
        rol: nuevoUsuario.rol,
        usuario: nuevoUsuario.usuario,
        correo: nuevoUsuario.correo,
        password: nuevoUsuario.password,
      });
      Swal.fire({
        icon: "Success",
        title: "El usuario se ha registrado con éxito",
      });

      setShowAddModal(false);

      setNuevoUsuario({
        nombre: "",
        apellidos: "",
        rol: "Medico(a)",
        usuario: "",
        correo: "",
        password: "",
      });

      cargarUsuarios();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error al registrar al usuario",
      });
      console.log(error.response.data.message);
    }
  };

  const eliminarUsuario = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "El usuario será desactivado.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/personas/${id}`);

      await Swal.fire({
        title: "Eliminado",
        text: "Usuario eliminado correctamente.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      cargarUsuarios();
    } catch (error) {
      console.error(error);

      Swal.fire({
        title: "Error",
        text: "No fue posible eliminar el usuario.",
        icon: "error",
      });
    }
  };
  useEffect(() => {
    cargarUsuarios();
  }, []);
  return (
    <>
      <div className="config-container">
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

            <Link to="/pacientes">
              <i className="fa-solid fa-user"></i>
              Pacientes
            </Link>

            <Link to="/triaje">
              <i className="fa-solid fa-notes-medical"></i>
              Triaje
            </Link>

            <Link to="/configuraciones" className="active">
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
            <h3>Configuraciones</h3>
            <div className="user">Administración de usuarios</div>
          </header>

          <section className="panel">
            <div className="panel-header">
              <h4>Administración de usuarios</h4>

              <button
                id="addUserBtn"
                onClick={() => {
                  setShowAddModal(true);
                }}
              >
                + Nuevo usuario
              </button>
            </div>

            <p className="hint">
              Como administrador puedes editar nombre, apellidos, rol, usuario y
              contraseña de cada usuario.
            </p>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Apellidos</th>
                    <th>Rol</th>
                    <th>Usuario</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id_persona}>
                      <td>{u.id_persona}</td>
                      <td>{u.nombre}</td>
                      <td>{u.apellidos}</td>
                      <td>{u.rol}</td>
                      <td>{u.usuario}</td>

                      <td>
                        <div className="actions">
                          <button onClick={() => abrirEditar(u)}>Editar</button>

                          <button
                            className="secondary"
                            onClick={() => eliminarUsuario(u.id_persona)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* EDITAR */}

        {showEditModal && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Detalles del médico</h2>

                <div
                  className="btnClose"
                  onClick={() => setShowEditModal(false)}
                >
                  ✕
                </div>
              </div>

              <div className="modal-form">
                <div>
                  <label>Nombre</label>

                  <input
                    value={usuarioEdit.nombre}
                    onChange={(e) =>
                      setUsuarioEdit({
                        ...usuarioEdit,
                        nombre: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label>Apellido</label>

                  <input
                    value={usuarioEdit.apellidos}
                    onChange={(e) =>
                      setUsuarioEdit({
                        ...usuarioEdit,
                        apellidos: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label>Rol</label>

                  <select
                    value={usuarioEdit.rol}
                    onChange={(e) =>
                      setUsuarioEdit({
                        ...usuarioEdit,
                        rol: e.target.value,
                      })
                    }
                  >
                    <option>Médico(a)</option>
                    <option>Paramédico(a)</option>
                    <option>Enfermero(a)</option>
                    <option>Admin</option>
                  </select>
                </div>

                <div>
                  <label>Usuario</label>

                  <input
                    value={usuarioEdit.usuario}
                    onChange={(e) =>
                      setUsuarioEdit({
                        ...usuarioEdit,
                        usuario: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="full">
                  <label>Contraseña</label>

                  <input
                    value={usuarioEdit.psswrd}
                    onChange={(e) =>
                      setUsuarioEdit({
                        ...usuarioEdit,
                        psswrd: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="full">
                  <button onClick={guardarEdicion}>Guardar cambios</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AGREGAR */}

        {showAddModal && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Agregar médico</h2>

                <div
                  className="btnClose"
                  onClick={() => setShowAddModal(false)}
                >
                  ✕
                </div>
              </div>

              <div className="modal-form">
                <div>
                  <label>Nombre</label>

                  <input
                    value={nuevoUsuario.nombre}
                    onChange={(e) =>
                      setNuevoUsuario({
                        ...nuevoUsuario,
                        nombre: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label>Apellido</label>

                  <input
                    value={nuevoUsuario.apellidos}
                    onChange={(e) =>
                      setNuevoUsuario({
                        ...nuevoUsuario,
                        apellidos: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label>Rol</label>

                  <select
                    value={nuevoUsuario.rol}
                    onChange={(e) =>
                      setNuevoUsuario({
                        ...nuevoUsuario,
                        rol: e.target.value,
                      })
                    }
                  >
                    <option>Médico(a)</option>
                    <option>Paramédico(a)</option>
                    <option>Enfermero(a)</option>
                    <option>Admin</option>
                  </select>
                </div>

                <div>
                  <label>Usuario</label>

                  <input
                    value={nuevoUsuario.usuario}
                    onChange={(e) =>
                      setNuevoUsuario({
                        ...nuevoUsuario,
                        usuario: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="full">
                  <label>Contraseña</label>

                  <input
                    value={nuevoUsuario.password}
                    onChange={(e) =>
                      setNuevoUsuario({
                        ...nuevoUsuario,
                        password: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="full">
                  <button onClick={agregarUsuario}>Agregar usuario</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
