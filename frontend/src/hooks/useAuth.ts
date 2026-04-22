import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ─── Constantes ───────────────────────────────────────────────────────────────

const API_URL = 'http://localhost:3001';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AuthContextType {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Guarda el token y el usuario en localStorage y en el estado */
const guardarSesion = (
  token: string,
  user: string,
  setToken: (t: string) => void,
  setUsername: (u: string) => void,
) => {
  setToken(token);
  setUsername(user);
  localStorage.setItem('token', token);
  localStorage.setItem('username', user);
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextType => {
  const navigate = useNavigate();

  // Inicializa el estado desde localStorage para mantener la sesión tras recargar
  const [token, setToken]       = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));

  const login = async (username: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, { username, password });
    const { token: newToken, username: user } = response.data;
    guardarSesion(newToken, user, setToken, setUsername);
    navigate('/dashboard');
  };

  const signup = async (username: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/signup`, { username, password });
    const { token: newToken, username: user } = response.data;
    guardarSesion(newToken, user, setToken, setUsername);
    navigate('/dashboard');
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return { token, username, isAuthenticated: !!token, login, signup, logout };
};



/** Devuelve el header de autorización para usarlo en las llamadas a la API */
export const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});