"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResumen = exports.deleteGasto = exports.createGasto = exports.getGastos = exports.deleteIngreso = exports.createIngreso = exports.getIngresos = exports.getCategorias = void 0;
const database_1 = require("../database/database");
// ---- CATEGORÍAS ----
const getCategorias = async (req, res) => {
    const result = await database_1.pool.query('SELECT * FROM categorias ORDER BY nombre');
    res.json(result.rows);
};
exports.getCategorias = getCategorias;
// ---- INGRESOS ----
const getIngresos = async (req, res) => {
    const { desde, hasta } = req.query;
    let query = 'SELECT * FROM ingresos WHERE usuario_id = $1';
    const params = [req.userId];
    if (desde && hasta) {
        query += ' AND fecha BETWEEN $2 AND $3';
        params.push(desde, hasta);
    }
    query += ' ORDER BY fecha DESC';
    const result = await database_1.pool.query(query, params);
    res.json(result.rows);
};
exports.getIngresos = getIngresos;
const createIngreso = async (req, res) => {
    const { monto, descripcion, fecha } = req.body;
    const result = await database_1.pool.query('INSERT INTO ingresos (monto, descripcion, fecha, usuario_id) VALUES ($1, $2, $3, $4) RETURNING *', [monto, descripcion, fecha || new Date(), req.userId]);
    res.status(201).json(result.rows[0]);
};
exports.createIngreso = createIngreso;
const deleteIngreso = async (req, res) => {
    await database_1.pool.query('DELETE FROM ingresos WHERE id = $1 AND usuario_id = $2', [req.params.id, req.userId]);
    res.json({ message: 'Ingreso eliminado' });
};
exports.deleteIngreso = deleteIngreso;
// ---- GASTOS ----
const getGastos = async (req, res) => {
    const { desde, hasta, categoria_id } = req.query;
    let query = `
    SELECT g.*, c.nombre AS categoria_nombre
    FROM gastos g
    LEFT JOIN categorias c ON g.categoria_id = c.id
    WHERE g.usuario_id = $1
  `;
    const params = [req.userId];
    if (desde && hasta) {
        params.push(desde, hasta);
        query += ` AND g.fecha BETWEEN $${params.length - 1} AND $${params.length}`;
    }
    if (categoria_id) {
        params.push(categoria_id);
        query += ` AND g.categoria_id = $${params.length}`;
    }
    query += ' ORDER BY g.fecha DESC';
    const result = await database_1.pool.query(query, params);
    res.json(result.rows);
};
exports.getGastos = getGastos;
const createGasto = async (req, res) => {
    const { monto, descripcion, fecha, categoria_id } = req.body;
    const result = await database_1.pool.query('INSERT INTO gastos (monto, descripcion, fecha, categoria_id, usuario_id) VALUES ($1, $2, $3, $4, $5) RETURNING *', [monto, descripcion, fecha || new Date(), categoria_id, req.userId]);
    res.status(201).json(result.rows[0]);
};
exports.createGasto = createGasto;
const deleteGasto = async (req, res) => {
    await database_1.pool.query('DELETE FROM gastos WHERE id = $1 AND usuario_id = $2', [req.params.id, req.userId]);
    res.json({ message: 'Gasto eliminado' });
};
exports.deleteGasto = deleteGasto;
// ---- RESUMEN / BALANCE ----
const getResumen = async (req, res) => {
    const ingresosRes = await database_1.pool.query('SELECT COALESCE(SUM(monto), 0) AS total FROM ingresos WHERE usuario_id = $1', [req.userId]);
    const gastosRes = await database_1.pool.query('SELECT COALESCE(SUM(monto), 0) AS total FROM gastos WHERE usuario_id = $1', [req.userId]);
    const totalIngresos = parseFloat(ingresosRes.rows[0].total);
    const totalGastos = parseFloat(gastosRes.rows[0].total);
    res.json({
        totalIngresos,
        totalGastos,
        balance: totalIngresos - totalGastos,
    });
};
exports.getResumen = getResumen;
