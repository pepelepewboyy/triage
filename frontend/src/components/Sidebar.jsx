import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../assets/estrella-vida.png";
import "../css/Sidebar.css";

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
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

  const isActive = (path) => (location.pathname === path ? "active" : "");

  const menuItems = [
    { path: "/dashboard", icon: "fa-house", label: "Dashboard" },
    { path: "/pacientes", icon: "fa-user", label: "Pacientes" },
    { path: "/triaje", icon: "fa-notes-medical", label: "Triage" },
    { path: "/configuraciones", icon: "fa-gear", label: "Configuración" },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-layout">
          <div className="sidebar-header">
            <img src={logo} alt="TrIAge" className="sidebar-logo-img" />
            <h5 className="sidebar-logo-text">TrIAge</h5>
          </div>

          <div className="sidebar-content">
            <nav className="sidebar-menu">
              <ul>
                {menuItems.map((item) => (
                  <li key={item.path} className={`sidebar-menu-item ${isActive(item.path)}`}>
                    <Link to={item.path} onClick={onClose}>
                      <span className="sidebar-menu-icon">
                        <i className={`fa-solid ${item.icon}`}></i>
                      </span>
                      <span className="sidebar-menu-title">{item.label}</span>
                    </Link>
                  </li>
                ))}

                {/* Cerrar sesión ahora es parte del menú, justo debajo de Configuraciones */}
                <li className="sidebar-menu-item">

                  <a href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      cerrarSesion();
                    }}
                  >
                    <span className="sidebar-menu-icon">
                      <i className="fa-solid fa-right-from-bracket"></i>
                    </span>
                    <span className="sidebar-menu-title">Cerrar sesión</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;