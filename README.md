# FitnessApp — Planes de Entrenamiento

Backend REST API con Spring Boot 4 + PostgreSQL para gestión de planes de entrenamiento.

---

## ✨ Últimas Mejoras

- **Sistema de Progreso de Ejercicios:** Los clientes pueden registrar el peso y las repeticiones por cada ejercicio, y ver su evolución en gráficos.
- **Panel de Profesor Mejorado:** Los profesores pueden ver los registros y la evolución histórica de sus clientes mediante gráficos detallados.
- **Sesiones Aisladas por Pestaña:** Se implementó `sessionStorage` para mantener las sesiones de forma independiente por cada pestaña del navegador, permitiendo iniciar sesión como distintos usuarios simultáneamente.
- **Rediseño de Interfaz de Cliente & Saludo:** Menú lateral a la izquierda en el panel del cliente consistente con el del profesor, y saludo personalizado con el nombre del usuario.
- **Integracion con Cloudinary para imagenes.
- **Implementacion de links mediante Youtube.
---


## 🛠️ Requisitos

| Herramienta | Versión mínima |
|-------------|---------------|
| Java | 17+ |
| Maven Wrapper | incluido (`mvnw`) |
| Docker & Docker Compose | cualquier versión reciente |

---

## 🚀 Setup rápido

### 1. Clonar el repositorio

```bash
git clone https://github.com/Tincho-git/fitnessapp-planes.git
cd fitnessapp-planes
```

### 2. Crear el archivo de variables de entorno

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

Edita `.env` y ajusta los valores si lo necesitás (por defecto funciona sin cambios).

### 3. Levantar la base de datos con Docker

```bash
docker compose up -d
```

Esto levanta un contenedor PostgreSQL 16 con:
- Base de datos: `fitness_app_db`
- Usuario: `postgres`
- Contraseña: la que tengas en `.env`
- Puerto: `5432`

Podés verificar que está listo con:

```bash
docker compose ps
```

### 4. Ejecutar el backend

```bash
cd backend/main
.\mvnw spring-boot:run       # Windows
./mvnw spring-boot:run       # Linux / macOS
```

La API quedará disponible en **http://localhost:8080**

---

## 📦 Estructura del proyecto

```
fitnessapp-planes/
├── docker-compose.yml       # Base de datos PostgreSQL en Docker
├── .env.example             # Template de variables de entorno
├── .env                     # Variables reales (NO commitear)
├── backend/
│   └── main/                # Spring Boot API
│       ├── src/
│       └── pom.xml
└── frontend/
    └── src/                 # Frontend (en desarrollo)
```

---

## 🐳 Comandos Docker útiles

```bash
# Levantar la base de datos
docker compose up -d

# Ver logs de PostgreSQL
docker compose logs -f postgres

# Detener los contenedores
docker compose down

# Detener Y borrar los datos (reset completo)
docker compose down -v
```

---

## ⚙️ Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_NAME` | Nombre de la base de datos | `fitness_app_db` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `210405` |
| `JWT_SECRET` | Clave secreta para JWT | `miClaveSecreta...` |
| `JWT_EXPIRATION` | Expiración del token (ms) | `86400000` (24h) |

---

## 🔐 Seguridad

- **Nunca** subas el archivo `.env` al repositorio.
- Cambiá `JWT_SECRET` por una clave aleatoria y larga en producción.
- Cambiá la contraseña de la base de datos en producción.
