import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../database/database';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { AuthRequest } from '../utils/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta';

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: 'Usuario y contraseña son obligatorios' });
    return;
  }
  try {
    const existing = await pool.query('SELECT id FROM usuarios WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      res.status(409).json({ message: 'El usuario ya existe' });
      return;
    }
    const passwordHash = await hashPassword(password);
    const result = await pool.query(
      'INSERT INTO usuarios (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, passwordHash]
    );
    const token = jwt.sign({ userId: result.rows[0].id }, JWT_SECRET, { expiresIn: '8h' });
    res.status(201).json({ token, username: result.rows[0].username });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: 'Usuario y contraseña son obligatorios' });
    return;
  }
  try {
    const result = await pool.query('SELECT id, password_hash FROM usuarios WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }
    const user = result.rows[0];
    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const getUserData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT id, username FROM usuarios WHERE id = $1', [req.userId]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};