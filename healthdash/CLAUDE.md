# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HealthDash is a microservices health monitoring dashboard. It consists of:
- **Frontend**: React 18 + Vite SPA (port 5173)
- **Backend**: Spring Boot 3.2.3 REST API (port 8080)
- **Database**: H2 in-memory (wiped on restart; schema auto-created via `ddl-auto=create-drop`)

---

## Commands

### Frontend (`frontend/`)

```bash
npm run dev       # Start dev server on port 5173
npm run build     # Production build to dist/
npm run preview   # Preview production build
```

### Backend (`backend/`)

```bash
./mvnw spring-boot:run          # Run in dev mode
./mvnw clean package            # Build JAR
java -jar target/healthdash-backend-*.jar  # Run JAR
```

No linting, formatting, or test runner is currently configured in either project.

---

## Architecture

### Frontend

Single-page app with React Router v6. All protected routes check `AuthContext` for a valid user — the context reads the JWT from `localStorage` (key: `hd_token`).

- **`src/api/client.js`** — Axios instance; attaches `Authorization: Bearer <token>` to every request via interceptor; redirects to `/login` on 401.
- **`src/context/AuthContext.jsx`** — Global auth state (`user`, `login`, `logout`). Wrap point for the entire app.
- **`src/App.jsx`** — Route definitions with `PrivateRoute`/`PublicRoute` guards.
- **`src/pages/`** — Full-page views (`Dashboard`, `ServiceDetail`, `AddService`, `Login`, `Register`).
- **`src/components/`** — Shared components including `Layout.jsx` (sidebar + nav shell).

Vite proxies `/api` → `http://localhost:8080` in dev, so frontend code always calls `/api/...` without specifying the backend host.

### Backend

Standard Spring Boot layered architecture under `com.healthdash`:

| Layer | Package | Responsibility |
|---|---|---|
| Controllers | `controller/` | REST endpoints; delegates to services |
| Services | `service/` | Business logic (CRUD, health check logic) |
| Scheduler | `scheduler/` | `@Scheduled` task runs health checks every 60 s |
| Repositories | `repository/` | Spring Data JPA interfaces |
| Models | `model/` | JPA entities: `User`, `MonitoredService`, `HealthCheck` |
| Auth | `auth/` | JWT generation/validation (`JwtUtil`), login/register endpoints, `JwtFilter` |
| Config | `config/` | `SecurityConfig` (filter chain, CORS, permit-list), `AppConfig` |
| Exceptions | `exception/` | `GlobalExceptionHandler` (`@RestControllerAdvice`) |

**Auth flow**: `POST /api/auth/login` → `JwtUtil.generateToken()` → token returned to client → `JwtFilter` validates token on every subsequent request and sets `SecurityContext`.

**CORS** is configured in `SecurityConfig` to allow `localhost:5173` and `localhost:3000`.

### Key API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Returns JWT |
| GET | `/api/services` | List user's monitored services |
| POST | `/api/services` | Add service |
| PUT | `/api/services/{id}` | Update service |
| DELETE | `/api/services/{id}` | Remove service |
| GET | `/api/services/{id}/history` | Health check history |
| POST | `/api/services/{id}/check-now` | Trigger immediate check |
| GET | `/api/dashboard/stats` | Aggregate stats |

### Configuration (`application.properties`)

JWT secret and expiry are set directly in `application.properties` (not externalized). The H2 console is available at `/h2-console`. The default health check interval is 60 seconds (`healthdash.default-interval=60`).
