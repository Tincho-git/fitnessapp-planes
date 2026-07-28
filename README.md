# FitnessApp — Planes de entrenamiento

Aplicación de planes de entrenamiento con React/Vite, Spring Boot, PostgreSQL y Cloudinary.

## Requisitos

- Java 17+
- Node.js 20+
- Docker Desktop (para PostgreSQL local)

## Desarrollo local

1. Copiá `.env.example` a `.env` en la raíz para Docker Compose y completá los valores.
2. Copiá `backend/main/.env.example` a `backend/main/.env` y usá los mismos secretos.
3. Copiá `frontend/.env.example` a `frontend/.env.local`.
4. Ejecutá `docker compose up -d` desde la raíz.
5. Ejecutá `./mvnw spring-boot:run` desde `backend/main`.
6. Ejecutá `npm ci && npm run dev` desde `frontend`.

El perfil `dev` crea los usuarios de muestra. No se activa en producción.

## Variables de entorno

Nunca subas un `.env`. Los archivos `.env.example` son plantillas sin secretos.

| Variable | Dónde se usa | Nota |
| --- | --- | --- |
| `DB_URL`, `DB_USER`, `DB_PASSWORD` | Backend | Conexión PostgreSQL JDBC. |
| `JWT_SECRET` | Backend | Cadena aleatoria larga. |
| `CLOUDINARY_*` | Backend | Credenciales nuevas de Cloudinary. |
| `FRONTEND_URL` | Backend | URL exacta de Vercel para CORS. |
| `VITE_API_URL` | Frontend | URL pública del backend Render. |
| `BOOTSTRAP_ADMIN_*` | Backend | Solo primer arranque de producción. |

## Producción

1. Creá PostgreSQL en Render (misma región que el backend) o en Neon.
2. Creá un Web Service de Render con raíz `backend/main` y Dockerfile.
3. Agregá las variables de entorno del backend en Render. Para el primer deploy configurá `BOOTSTRAP_ADMIN_ENABLED=true` y las variables de admin; tras crear la cuenta, ponelo en `false`.
4. Creá el proyecto Vercel desde `frontend`, con `VITE_API_URL=https://tu-api.onrender.com`.
5. Actualizá `FRONTEND_URL` en Render con la URL final de Vercel y redeployá el backend.

Las tablas se crean y evolucionan mediante migraciones Flyway ubicadas en `backend/main/src/main/resources/db/migration`.

## Roles y altas de cuenta

- `ADMIN`: se crea inicialmente con `BOOTSTRAP_ADMIN_*`. Revisa y aprueba o rechaza las solicitudes de profesores.
- `PROFESOR`: se registra desde la web y queda en estado `PENDING` hasta que un administrador lo aprueba. Una vez activo accede a su panel de clientes, ejercicios y planes.
- `CLIENT`: se registra indicando el email de un profesor activo. Accede a su plan y métricas.
