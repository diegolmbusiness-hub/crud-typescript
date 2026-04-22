import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const poolConfig: PoolConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
};

const password = process.env.DB_PASSWORD || process.env.PGPASSWORD;
if (typeof password === 'string' && password.length > 0) {
  poolConfig.password = password;
}

export const pool = new Pool(poolConfig);
