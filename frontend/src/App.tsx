import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Dashboard from './components/Dashboard';


const App: React.FC = () => {
  // Comprueba si hay sesión activa leyendo el token guardado
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Routes>
      <Route path="/login"   element={<LoginForm />} />
      <Route path="/signup"  element={<SignupForm />} />

      {/* Ruta protegida: redirige al login si no hay sesión */}
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
      />

      {/* Cualquier ruta desconocida va al dashboard (o al login si no hay sesión) */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default App;