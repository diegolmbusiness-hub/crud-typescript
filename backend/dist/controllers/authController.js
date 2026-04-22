"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserData = exports.login = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../database/database");
const passwordUtils_1 = require("../utils/passwordUtils");
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta';
const signup = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ message: 'Usuario y contraseña son obligatorios' });
        return;
    }
    try {
        const existing = await database_1.pool.query('SELECT id FROM usuarios WHERE username = $1', [username]);
        if (existing.rows.length > 0) {
            res.status(409).json({ message: 'El usuario ya existe' });
            return;
        }
        const passwordHash = await (0, passwordUtils_1.hashPassword)(password);
        const result = await database_1.pool.query('INSERT INTO usuarios (username, password_hash) VALUES ($1, $2) RETURNING id, username', [username, passwordHash]);
        const token = jsonwebtoken_1.default.sign({ userId: result.rows[0].id }, JWT_SECRET, { expiresIn: '8h' });
        res.status(201).json({ token, username: result.rows[0].username });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ message: 'Usuario y contraseña son obligatorios' });
        return;
    }
    try {
        const result = await database_1.pool.query('SELECT id, password_hash FROM usuarios WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            res.status(401).json({ message: 'Credenciales inválidas' });
            return;
        }
        const user = result.rows[0];
        const valid = await (0, passwordUtils_1.comparePassword)(password, user.password_hash);
        if (!valid) {
            res.status(401).json({ message: 'Credenciales inválidas' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, username });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};
exports.login = login;
const getUserData = async (req, res) => {
    try {
        const result = await database_1.pool.query('SELECT id, username FROM usuarios WHERE id = $1', [req.userId]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Get user data error:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};
exports.getUserData = getUserData;
