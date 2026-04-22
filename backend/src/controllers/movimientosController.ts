import { Response } from 'express';
import { pool } from '../database/database';
import { AuthRequest } from '../utils/authMiddleware';

// ---- CATEGORÍAS ----
export const getCategorias = async (req: AuthRequest, res: Response): Promise<void> => {
  const result = await pool.query('SELECT * FROM categorias ORDER BY nombre');
  res.json(result.rows);
};

// ---- INGRESOS ----
export const getIngresos = async (req: AuthRequest, res: Response): Promise<void> => {
  const { desde, hasta } = req.query;
  let query = 'SELECT * FROM ingresos WHERE usuario_id = $1';
  const params: any[] = [req.userId];

  if (desde && hasta) {
    query += ' AND fecha BETWEEN $2 AND $3';
    params.push(desde, hasta);
  }
  query += ' ORDER BY fecha DESC';

  const result = await pool.query(query, params);
  res.json(result.rows);
};

export const createIngreso = async (req: AuthRequest, res: Response): Promise<void> => {
  const { monto, descripcion, fecha } = req.body;
  const result = await pool.query(
    'INSERT INTO ingresos (monto, descripcion, fecha, usuario_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [monto, descripcion, fecha || new Date(), req.userId]
  );
  res.status(201).json(result.rows[0]);
};

export const deleteIngreso = async (req: AuthRequest, res: Response): Promise<void> => {
  await pool.query('DELETE FROM ingresos WHERE id = $1 AND usuario_id = $2', [req.params.id, req.userId]);
  res.json({ message: 'Ingreso eliminado' });
};

// ---- GASTOS ----
export const getGastos = async (req: AuthRequest, res: Response): Promise<void> => {
  const { desde, hasta, categoria_id } = req.query;
  let query = `
    SELECT g.*, c.nombre AS categoria_nombre
    FROM gastos g
    LEFT JOIN categorias c ON g.categoria_id = c.id
    WHERE g.usuario_id = $1
  `;
  const params: any[] = [req.userId];

  if (desde && hasta) {
    params.push(desde, hasta);
    query += ` AND g.fecha BETWEEN $${params.length - 1} AND $${params.length}`;
  }
  if (categoria_id) {
    params.push(categoria_id);
    query += ` AND g.categoria_id = $${params.length}`;
  }
  query += ' ORDER BY g.fecha DESC';

  const result = await pool.query(query, params);
  res.json(result.rows);
};

export const createGasto = async (req: AuthRequest, res: Response): Promise<void> => {
  const { monto, descripcion, fecha, categoria_id } = req.body;
  const result = await pool.query(
    'INSERT INTO gastos (monto, descripcion, fecha, categoria_id, usuario_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [monto, descripcion, fecha || new Date(), categoria_id, req.userId]
  );
  res.status(201).json(result.rows[0]);
};

export const deleteGasto = async (req: AuthRequest, res: Response): Promise<void> => {
  await pool.query('DELETE FROM gastos WHERE id = $1 AND usuario_id = $2', [req.params.id, req.userId]);
  res.json({ message: 'Gasto eliminado' });
};

// RESUMEN / BALANCE 
export const getResumen = async (req: AuthRequest, res: Response): Promise<void> => {
  const ingresosRes = await pool.query(
    'SELECT COALESCE(SUM(monto), 0) AS total FROM ingresos WHERE usuario_id = $1',
    [req.userId]
  );
  const gastosRes = await pool.query(
    'SELECT COALESCE(SUM(monto), 0) AS total FROM gastos WHERE usuario_id = $1',
    [req.userId]
  );
  const totalIngresos = parseFloat(ingresosRes.rows[0].total);
  const totalGastos = parseFloat(gastosRes.rows[0].total);

  res.json({
    totalIngresos,
    totalGastos,
    balance: totalIngresos - totalGastos,
  });
};
