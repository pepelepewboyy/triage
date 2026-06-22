import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/style.css";
import logo from "../assets/logo.png";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    user: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/login", {
        usuario: formData.user,
        password: formData.password,
      });

      // Guardar usuario en localStorage
      localStorage.setItem("usuario", JSON.stringify(response.data.usuario));
      localStorage.setItem(
        "id_persona",
        JSON.stringify(response.data.id_persona),
      );
      Swal.fire({
        title: `Bienvenido ${response.data.usuario.nombre}`,
        icon: "success",
        draggable: true,
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (error) {
      setError(error.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");

    if (usuario) {
      navigate("/dashboard");
    }
  });

  return (
    <div className="contenedor-princ">
      {" "}
      <div className="contenedor">
        {" "}
        <img src={logo} alt="TrIAge" className="logo" />
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            name="user"
            placeholder="Ingrese su usuario"
            className="txt"
            value={formData.user}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Ingrese su contraseña"
            className="txt"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && (
            <p
              style={{
                color: "red",
                margin: 0,
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <button type="submit" id="btnIniciar" disabled={loading}>
            {loading ? "Iniciando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
