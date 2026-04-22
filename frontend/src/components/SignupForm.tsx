import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Container, Typography, TextField,
  Button, Box, Alert,
} from '@mui/material';
import logo from '../assets/logo.png';

//Componente

const SignupForm: React.FC = () => {
  const { signup } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      await signup(username, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear cuenta');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f4f8' }}>
      <Container maxWidth="xs">
        <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, boxShadow: 3 }}>

          {/* Logo centrado */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{ height: 80, objectFit: 'contain' }}
            />
          </Box>

          <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
            Gastos Personales
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Crea tu cuenta
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth required
              label="Email"
              margin="normal"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <TextField
              fullWidth required
              label="Contraseña"
              type="password"
              margin="normal"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <TextField
              fullWidth required
              label="Confirmar Contraseña"
              type="password"
              margin="normal"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />

            {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}

            <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 2 }}>
              Registrarse
            </Button>

            <Typography variant="body2" align="center">
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </Typography>
          </Box>

        </Box>
      </Container>
    </Box>
  );
};

export default SignupForm;