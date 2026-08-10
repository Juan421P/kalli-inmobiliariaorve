# Kalli Inmobiliaria Orve

Plataforma web para la gestión y publicación de propiedades inmobiliarias (venta y alquiler), con manejo de clientes, colaboradores, administradores y ofertas sobre propiedades.

## Integrantes

* **Camila Mariana Quinteros Gómez**
* **Adriana Paola Martínez Vázquez**
* **Juan Adolfo Portillo Sánchez**
* **Christopher Alexander Morales Quijano**
* **Paolo Alberto Barahona Zepeda**

## Contenido

* [Acerca del proyecto](#acerca-del-proyecto)
* [Estructura del proyecto](#estructura-del-proyecto)
* [Tecnologías](#tecnologías)
* [Nomenclaturas](#nomenclaturas)
* [Requisitos previos](#requisitos-previos)
* [Instalación](#instalación)
* [Scripts disponibles](#scripts-disponibles)
* [API](#api)
* [Modelo de datos](#modelo-de-datos)
* [Licencia](#licencia)

## Acerca del proyecto

Kalli es una plataforma inmobiliaria compuesta por una API REST y una aplicación web, pensada para administrar el ciclo completo de una propiedad: publicación, búsqueda geoespacial, seguimiento de vistas, ofertas y contraofertas, y roles diferenciados para clientes, colaboradores y administradores.

El sistema permite gestionar propiedades destinadas a venta o alquiler, así como administrar los usuarios involucrados en el proceso inmobiliario y las ofertas realizadas sobre las propiedades.

## Estructura del proyecto

```text
kalli-inmobiliariaorve/
├── backend/     API REST — Node.js + Express + MongoDB
└── frontend/    Aplicación web — React + Vite
```

## Tecnologías

### Backend

* Node.js + Express 5
* MongoDB + Mongoose
* Zod para validación de esquemas
* Helmet, CORS y express-rate-limit
* Cookies httpOnly para sesión
* Nodemailer para verificación y recuperación de cuenta

### Frontend

* React 19
* Vite
* ESLint

## Nomenclaturas

Para mantener una estructura de código consistente y facilitar el mantenimiento del proyecto, se establecen las siguientes nomenclaturas:

| Elemento                                    | Nomenclatura | Ejemplo                             |
| ------------------------------------------- | ------------ | ----------------------------------- |
| Variables relacionadas con la base de datos | `snake_case` | `property_type`, `created_at`       |
| Variables propias del código                | `camelCase`  | `propertyType`, `createdAt`         |
| Clases                                      | `PascalCase` | `PropertyService`, `UserController` |
| Archivos de código                          | `snake_case` | `property_controller.js`            |
| Archivos del frontend                       | `camelCase`  | `propertyCard.jsx`                  |
| Archivos de clases                          | `PascalCase` | `PropertyService.js`                |
| Endpoints                                   | `kebab-case` | `/password-recovery`                |
| Variables relacionadas con HTTP             | `snake_case` | `session_token`, `refresh_token`    |

## Requisitos previos

* Node.js 18 o superior.
* Una instancia de MongoDB, local o en la nube, por ejemplo MongoDB Atlas.

## Instalación

```bash
git clone <url-del-repositorio>
cd kalli-inmobiliariaorve
```

### Backend

```bash
cd backend
npm install
```

Crea un archivo `.env` en `backend/` con al menos la siguiente variable:

```env
DB_URI=mongodb://localhost:27017/kalli-inmobiliaria
```

Inicia el servidor:

```bash
node index.js
```

El servidor queda disponible en `http://localhost:4000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Scripts disponibles

### Backend

| Comando         | Descripción                                  |
| --------------- | -------------------------------------------- |
| `node index.js` | Inicia el servidor Express en el puerto 4000 |

### Frontend

| Comando           | Descripción                                    |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con recarga en caliente |
| `npm run build`   | Genera el build de producción                  |
| `npm run preview` | Sirve el build de producción localmente        |
| `npm run lint`    | Ejecuta ESLint sobre el código                 |

## API

Todas las rutas están montadas bajo el prefijo `/api`.

| Recurso         | Base URL            | Descripción                                                       |
| --------------- | ------------------- | ----------------------------------------------------------------- |
| Clientes        | `/api/client`       | Registro, login, recuperación de contraseña y gestión de clientes |
| Administradores | `/api/admin`        | Registro, login y gestión de administradores                      |
| Colaboradores   | `/api/collaborator` | Registro, login y gestión de colaboradores                        |

Cada recurso de tipo usuario (`client`, `admin`, `collaborator`) expone un CRUD base:

```text
GET    /             Listar
POST   /             Crear
GET    /:id          Obtener por ID
PUT    /:id          Actualizar
DELETE /:id          Eliminar
POST   /search       Búsqueda avanzada
```

Además de las siguientes rutas de autenticación:

```text
POST /login
POST /logout
POST /verify-email
POST /password-recovery/request
POST /password-recovery/verify
POST /password-recovery/change-password
```

Los endpoints protegidos requieren una cookie de sesión válida y, según el caso, permisos de administrador o de dueño del recurso.

## Modelo de datos

| Entidad        | Descripción                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| `property`     | Propiedades en venta o alquiler: tipo, precio, ubicación geoespacial, características, imágenes, etc. |
| `client`       | Usuarios que publican o buscan propiedades.                                                           |
| `collaborator` | Personal asociado a la gestión de propiedades.                                                        |
| `admin`        | Administradores de la plataforma.                                                                     |
| `offer`        | Ofertas sobre una propiedad, con contraofertas y resolución.                                          |

## Licencia

Este proyecto se desarrolla con fines académicos y/o institucionales. La información correspondiente a la licencia deberá definirse de acuerdo con las condiciones establecidas para el proyecto.
