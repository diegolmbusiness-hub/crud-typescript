import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import movimientosRoutes from './routes/movimientos';
import { pool } from './database/database';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api', movimientosRoutes);

app.get('/', (_, res) => res.send('Backend de Gastos Personales corriendo'));

app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});

process.on('SIGINT', async () => {
  await pool.end();
  process.exit();
});
