import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/style.css";
import logo from "../assets/logo.png";
import Swal from "sweetalert2";
import api from "../services/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    user: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

      localStorage.setItem("usuario", JSON.stringify(response.data.usuario));
      localStorage.setItem(
        "id_persona",
        JSON.stringify(response.data.id_persona)
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
        console.log("ERROR COMPLETO:", error);

        if (error.response) {
          console.log("Status:", error.response.status);
          console.log("Data:", error.response.data);
        } else {
          console.log("No hubo respuesta del servidor");
          console.log(error.message);
        }

        setError(
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message
        );
} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");

    if (usuario) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="contenedor-princ">
      <div className="contenedor">

        <img src={logo} alt="TrIAge" className="logo" />

        <div className="login-header">
          <p>Bienvenido</p>
        </div>

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

          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Ingrese su contraseña"
              className="txt"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

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