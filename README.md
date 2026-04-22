# Sistema de Gastos Personales

Aplicación web fullstack para la gestión de ingresos y gastos personales. Permite a los usuarios registrar, consultar y analizar sus movimientos financieros, facilitando el control y organización de sus finanzas.

---

## Información Académica

**Asignatura:** Programación III
**Facilitador:** Emilio José Peña López

**Participantes:**

* Ronald Bernechea Beato (2024-0228)
* Diego López (2023-0984)

**Fecha:** 6 de abril de 2026

---

## Descripción

El Sistema de Gastos Personales es una aplicación web que permite llevar un control detallado de los ingresos y gastos de un usuario.

El sistema ofrece:

* Registro de ingresos y gastos
* Clasificación por categorías
* Visualización de balance general
* Consulta de movimientos financieros
* Filtros por fecha y categoría

Su objetivo es mejorar la organización financiera y promover un uso responsable del dinero.

---

## Requisitos Previos

* Node.js v18 o superior
* PostgreSQL instalado y en ejecución
* npm

---

## Configuración del Proyecto

### 1. Clonar repositorio

```bash
git clone https://github.com/diegolmbusiness-hub/gastos-personales.git
cd gastos-personales
```

---

## Configuración de la Base de Datos

### Crear base de datos

1. Abrir pgAdmin o psql
2. Crear la base de datos:

```sql
CREATE DATABASE gastos_personales;
```

---

### Ejecutar script SQL

Ejecutar el archivo `database.sql`:

```sql
\c gastos_personales
\i database.sql
```

Este script crea:

* Tabla de usuarios
* Tabla de ingresos
* Tabla de gastos
* Tabla de categorías
* Datos iniciales de categorías

---

## Backend

### Instalación y ejecución

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Servidor disponible en:

```
http://localhost:3001
```

---

### Variables de entorno

Configurar el archivo `.env`:

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

## Frontend

### Instalación y ejecución

```bash
cd frontend
npm install
npm start
```

Aplicación disponible en:

```
http://localhost:3000
```

---

## Arquitectura del Proyecto

### Frontend

* Interfaz de usuario responsiva
* Formularios de autenticación
* Panel principal (dashboard)
* Gestión de ingresos y gastos

### Backend

* API RESTful
* Autenticación con JWT
* Controladores para usuarios, ingresos y gastos
* Manejo de lógica del sistema

### Base de Datos

* Usuarios
* Ingresos
* Gastos
* Categorías

---

## Estructura del Proyecto

```
gastos-personales/
├── database.sql
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── database/database.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   └── movimientosController.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   └── movimientos.ts
│   │   └── utils/
│   │       ├── authMiddleware.ts
│   │       └── passwordUtils.ts
│   └── .env.example
└── frontend/
    ├── public/index.html
    └── src/
        ├── index.tsx
        ├── App.tsx
        ├── hooks/useAuth.ts
        └── components/
            ├── LoginForm.tsx
            ├── SignupForm.tsx
            └── Dashboard.tsx
```

---

## Endpoints del API

| Método | Ruta              | Descripción                 |
| ------ | ----------------- | --------------------------- |
| POST   | /auth/signup      | Registro de usuario         |
| POST   | /auth/login       | Inicio de sesión            |
| GET    | /auth/user        | Obtener usuario autenticado |
| GET    | /api/resumen      | Balance total               |
| GET    | /api/categorias   | Listar categorías           |
| GET    | /api/ingresos     | Listar ingresos             |
| POST   | /api/ingresos     | Crear ingreso               |
| DELETE | /api/ingresos/:id | Eliminar ingreso            |
| GET    | /api/gastos       | Listar gastos               |
| POST   | /api/gastos       | Crear gasto                 |
| DELETE | /api/gastos/:id   | Eliminar gasto              |

---

## Tecnologías Utilizadas

* Frontend: React, TypeScript, Material UI
* Backend: Node.js, Express, TypeScript
* Base de datos: PostgreSQL
* Autenticación: JSON Web Token (JWT)
* Seguridad: bcrypt

---

## Funcionalidades

* Registro e inicio de sesión de usuarios
* Gestión de ingresos
* Gestión de gastos
* Clasificación por categorías
* Visualización de balance
* Filtros de búsqueda
* Persistencia en base de datos

---

## Riesgos del Proyecto

* Fallos en la conexión a la base de datos
* Errores durante el desarrollo
* Limitaciones de tiempo
* Complejidad técnica del sistema

---

## Estado del Proyecto

En desarrollo. El sistema es funcional, pero puede mejorarse en validaciones, seguridad y experiencia de usuario.
