-- ============================================
-- Sistema de Gastos Personales - Base de Datos
-- ============================================

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

INSERT INTO categorias (nombre) VALUES
  ('Comida'),
  ('Transporte'),
  ('Entretenimiento'),
  ('Salud'),
  ('Educación'),
  ('Ropa'),
  ('Servicios'),
  ('Otros')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS ingresos (
  id SERIAL PRIMARY KEY,
  monto DECIMAL(10, 2) NOT NULL,
  descripcion VARCHAR(255),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gastos (
  id SERIAL PRIMARY KEY,
  monto DECIMAL(10, 2) NOT NULL,
  descripcion VARCHAR(255),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria_id INT REFERENCES categorias(id),
  usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE
);
