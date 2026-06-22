import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../assets/estrella-vida.png";
import api from "../services/api";
import "../css/styles-triage.css";

export default function Triage() {
  const navigate = useNavigate();
  const [tipoPaciente, setTipoPaciente] = useState("existente");

  const [paciente, setPaciente] = useState({
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    edad: "",
    sexo: "Masculino",
    nss: "",
    tipo_sangre: "O+",
  });

  const [buscarPaciente, setBuscarPaciente] = useState("");
  const [resultados, setResultados] = useState([]);

  const [idPaciente, setIdPaciente] = useState("");

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const [triage, setTriage] = useState({
    frecuenciaCardiaca: "",
    presion: "",
    temperatura: "",
    sintomas: "",
    nivel_triage: "",
    metodo_evaluacion: "ABC",
    comentario: "",
  });

  const insertarPaciente = async () => {
    try {
      if (tipoPaciente === "nuevo") {
        const formData = new FormData();

        const response = await api.post("/pacientes", {
          nombre_completo: `${paciente.nombre} ${paciente.apellido}`,
          fecha_nacimiento: paciente.fecha_nacimiento,
          edad: paciente.edad,
          sexo: paciente.sexo,
          nss: paciente.nss,
          tipo_sangre: paciente.tipo_sangre,
        });
        Swal.fire({
          title: "Paciente insertado con éxito!",
          text:
            "Paciente registrado correctamente con ID " +
            response.data.id_paciente,
          icon: "success",
        });

        setIdPaciente(response.data.id_paciente);
      } else {
        if (!buscarPaciente.trim()) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Escribe algo para buscar ",
          });
          return;
        }

        const formData = new FormData();
        formData.append("accion", "buscar");
        formData.append("busqueda", buscarPaciente);

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
    if (!triage.sintomas || !triage.nivel_triage || !triage.metodo_evaluacion) {
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
        sintomas: triage.sintomas,
        metodo: triage.metodo_evaluacion,
        nivel: triage.nivel_triage,
        comentario: triage.comentario,
        frecuencia: triage.frecuenciaCardiaca,
        presion: triage.presion,
        temperatura: triage.temperatura,
        id_persona: usuario.id_persona,
        id_paciente: idPaciente,
      });
      Swal.fire({
        title: "Paciente insertado con éxito!",
        text:
          "Triage registrado correctamente con ID " + response.data.id_triage,
        icon: "success",
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      if (error.response?.status === 409) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.response.data.message,
        });
        return;
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Error al registrar el triage",
        });
      }

      console.error(error);
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

  return (
    <div className="triage-container">
      {/* SIDE BAR */}
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

          <Link to="/triaje" className="active">
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
          <h3>Triage</h3>
          <div className="user">Hola! {usuario.nombre}</div>
        </header>

        <div className="triage-content">
          {/* PACIENTE */}
          <form id="formPaciente">
            <div className="card">
              <h3>Paciente</h3>

              <label>
                <input
                  type="radio"
                  checked={tipoPaciente === "existente"}
                  onChange={() => setTipoPaciente("existente")}
                />
                Paciente existente
              </label>

              <label>
                <input
                  type="radio"
                  checked={tipoPaciente === "nuevo"}
                  onChange={() => setTipoPaciente("nuevo")}
                />
                Nuevo paciente
              </label>

              {tipoPaciente === "existente" ? (
                <div id="busquedaPaciente">
                  <input
                    type="text"
                    placeholder="Buscar por NSS o nombre"
                    value={buscarPaciente}
                    onChange={(e) => setBuscarPaciente(e.target.value)}
                  />

                  <div id="resultados">
                    {resultados.length === 0 ? (
                      <p>No hay resultados</p>
                    ) : (
                      resultados.map((p) => (
                        <div
                          key={p.id_paciente}
                          className="resultado-item"
                          onClick={() => {
                            setIdPaciente(p.id_paciente);
                            Swal.fire({
                              icon: "success",
                              title: "Seleccionaste un paciente",
                              text: `Paciente seleccionado: ${p.id_paciente}`,
                            });
                          }}
                          style={{
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            marginBottom: "5px",
                            cursor: "pointer",
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
                    placeholder="Nombre"
                    value={paciente.nombre}
                    onChange={(e) =>
                      setPaciente({
                        ...paciente,
                        nombre: e.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Apellido"
                    value={paciente.apellido}
                    onChange={(e) =>
                      setPaciente({
                        ...paciente,
                        apellido: e.target.value,
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
                    placeholder="Edad"
                    value={paciente.edad}
                    onChange={(e) =>
                      setPaciente({
                        ...paciente,
                        edad: e.target.value,
                      })
                    }
                  />

                  <select
                    value={paciente.sexo}
                    onChange={(e) =>
                      setPaciente({
                        ...paciente,
                        sexo: e.target.value,
                      })
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
                      setPaciente({
                        ...paciente,
                        nss: e.target.value,
                      })
                    }
                  />

                  <label>Tipo de Sangre</label>

                  <select
                    value={paciente.tipo_sangre}
                    onChange={(e) =>
                      setPaciente({
                        ...paciente,
                        tipo_sangre: e.target.value,
                      })
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
                </div>
              )}

              <button type="button" className="btn" onClick={insertarPaciente}>
                Consultar/Insertar paciente
              </button>
            </div>
          </form>

          {/* TRIAGE */}
          <form id="formTriage">
            <div className="card">
              <h3>Frecuencia Cardiaca</h3>
              <input
                type="text"
                value={triage.frecuenciaCardiaca}
                onChange={(e) =>
                  setTriage({
                    ...triage,
                    frecuenciaCardiaca: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="card">
              <h3>Presion Arterial</h3>
              <input
                type="text"
                value={triage.presion}
                onChange={(e) =>
                  setTriage({
                    ...triage,
                    presion: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="card">
              <h3>Temperatura</h3>
              <input
                type="text"
                value={triage.temperatura}
                onChange={(e) =>
                  setTriage({
                    ...triage,
                    temperatura: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="card sintomas">
              <h3>Sintomas e Historia clinica</h3>
              <textarea
                rows="8"
                value={triage.sintomas}
                onChange={(e) =>
                  setTriage({
                    ...triage,
                    sintomas: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="card ">
              <h3>Comentarios</h3>

              <textarea
                rows="8"
                value={triage.comentario}
                onChange={(e) =>
                  setTriage({
                    ...triage,
                    comentario: e.target.value,
                  })
                }
              />
            </div>

            <div className="card">
              <h3>Nivel de Triage</h3>

              <select
                value={triage.nivel_triage}
                onChange={(e) =>
                  setTriage({
                    ...triage,
                    nivel_triage: e.target.value,
                  })
                }
              >
                <option value="">Seleccione nivel</option>
                <option value="rojo">Rojo - Emergencia</option>
                <option value="naranja">Naranja - Muy urgente</option>
                <option value="amarillo">Amarillo - Urgente</option>
                <option value="verde">Verde - Poco urgente</option>
                <option value="azul">Azul - No urgente</option>
              </select>
              <h3>Metodo de Evaluacion</h3>

              <select
                value={triage.metodo_evaluacion}
                onChange={(e) =>
                  setTriage({
                    ...triage,
                    metodo_evaluacion: e.target.value,
                  })
                }
              >
                <option value="">SELECCIONE UN MÉTODO</option>
                <option value="START">START</option>
                <option value="JumpStart">JumpStart</option>
                <option value="META">META</option>
                <option value="Manchester">Manchester</option>
                <option value="Triage IMSS">Triage IMSS</option>
                <option value="Triage ISSSTE">Triage ISSSTE</option>
              </select>
            </div>

            <div className="card botones">
              <button type="button" className="btn" onClick={insertarTriage}>
                Guardar Evaluacion
              </button>
              <button type="button" className="btn" onClick={insertarTriage}>
                IA Evaluacion
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
