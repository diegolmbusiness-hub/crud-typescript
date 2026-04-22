# Sistema de Gastos Personales
**Participantes:** Ronald Bernechea Beato (2024-0228) | Diego López (2023-0984)  
**Asignatura:** Programación III

---

## Requisitos previos
- Node.js v18+
- PostgreSQL instalado y corriendo
- npm

---

## 1. Base de datos

1. Abre pgAdmin o psql
2. Crea una base de datos llamada `gastos_personales`
3. Ejecuta el archivo `database.sql` en esa base de datos:
   ```sql
   -- En psql:
   \c gastos_personales
   \i database.sql
   ```

---

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tus datos de PostgreSQL
npm run dev
```

El backend corre en: `http://localhost:3001`

### Variables de entorno (.env)
```
PORT=3001
DB_USER=postgres
DB_HOST=localhost
DB_NAME=gastos_personales
DB_PASSWORD=tu_password_aqui
DB_PORT=5432
JWT_SECRET=cambia_esta_clave_secreta
```

---

## 3. Frontend

```bash
cd frontend
npm install
npm start
```

El frontend corre en: `http://localhost:3000`

---

## Estructura del proyecto

```
gastos-personales/
├── database.sql                  # Script de la base de datos
├── backend/
│   ├── src/
│   │   ├── index.ts              # Servidor principal
│   │   ├── database/database.ts  # Conexión a PostgreSQL
│   │   ├── controllers/
│   │   │   ├── authController.ts         # Login, signup
│   │   │   └── movimientosController.ts  # Ingresos, gastos, resumen
│   │   ├── routes/
│   │   │   ├── auth.ts           # Rutas de autenticación
│   │   │   └── movimientos.ts    # Rutas de ingresos/gastos
│   │   └── utils/
│   │       ├── authMiddleware.ts  # Verificación JWT
│   │       └── passwordUtils.ts  # bcrypt hash/compare
│   └── .env.example
└── frontend/
    ├── public/index.html
    └── src/
        ├── index.tsx             # Entrada de la app
        ├── App.tsx               # Rutas principales
        ├── hooks/useAuth.ts      # Lógica de autenticación
        └── components/
            ├── LoginForm.tsx     # Formulario de login
            ├── SignupForm.tsx    # Formulario de registro
            └── Dashboard.tsx     # Panel principal completo
```

---

## Endpoints del API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /auth/signup | Registro de usuario |
| POST | /auth/login | Inicio de sesión |
| GET | /auth/user | Datos del usuario autenticado |
| GET | /api/resumen | Balance total del usuario |
| GET | /api/categorias | Lista de categorías |
| GET | /api/ingresos | Listar ingresos (filtro: desde, hasta) |
| POST | /api/ingresos | Crear ingreso |
| DELETE | /api/ingresos/:id | Eliminar ingreso |
| GET | /api/gastos | Listar gastos (filtro: desde, hasta, categoria_id) |
| POST | /api/gastos | Crear gasto |
| DELETE | /api/gastos/:id | Eliminar gasto |

---

## Tecnologías utilizadas
- **Frontend:** React + TypeScript + Material UI
- **Backend:** Node.js + Express + TypeScript
- **Base de datos:** PostgreSQL
- **Autenticación:** JWT + bcrypt
