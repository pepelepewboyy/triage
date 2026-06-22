import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import Triaje from "./pages/Triaje";
import Seguimiento from "./pages/Seguimiento";
import Configuraciones from "./pages/Configuraciones";
import ProtectedRoute from "./pages/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pacientes"
          element={
            <ProtectedRoute>
              <Pacientes />
            </ProtectedRoute>
          }
        />

        <Route
          path= "/triaje"
          element={
            <ProtectedRoute>
              <Triaje />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seguimiento/:id"
          element={
            <ProtectedRoute>
              <Seguimiento />
            </ProtectedRoute>
          }
        />

        <Route
          path="/configuraciones"
          element={
            <ProtectedRoute>
              <Configuraciones />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
