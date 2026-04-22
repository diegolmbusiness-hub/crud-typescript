import { Router } from 'express';
import { authMiddleware } from '../utils/authMiddleware';
import {
  getCategorias,
  getIngresos, createIngreso, deleteIngreso,
  getGastos, createGasto, deleteGasto,
  getResumen,
} from '../controllers/movimientosController';

const router = Router();

router.use(authMiddleware);

router.get('/categorias', getCategorias);
router.get('/resumen', getResumen);

router.get('/ingresos', getIngresos);
router.post('/ingresos', createIngreso);
router.delete('/ingresos/:id', deleteIngreso);

router.get('/gastos', getGastos);
router.post('/gastos', createGasto);
router.delete('/gastos/:id', deleteGasto);

export default router;
