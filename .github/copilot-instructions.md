# Skillyug AI Coding Agent Instructions

This document provides essential guidance for AI coding agents to effectively contribute to the Skillyug codebase.

## 1. Big Picture Architecture

The Skillyug platform is a monorepo with two main components: a **Next.js frontend** and a **Node.js/Express backend**.

-   **`frontend-nextjs/`**: A modern Next.js 15 application using the App Router, Tailwind CSS, and TypeScript. It handles all user-facing views and interactions. Authentication is managed via `next-auth`.
-   **`Backend/`**: A Node.js/Express API server built with TypeScript. It connects to a PostgreSQL database via Prisma ORM and uses Redis for caching. This service manages business logic, data persistence, and external integrations like Razorpay for payments.
-   **`docker-compose.yml`**: Defines the production and development environments, orchestrating the frontend, backend, PostgreSQL, and Redis services.
-   **`Makefile`**: Provides convenient commands for managing the Dockerized environment (e.g., `make dev`, `make prod`, `make clean`).

**Data Flow:** The Next.js frontend communicates with the backend via RESTful API endpoints. The backend processes requests, interacts with the database, and returns JSON responses.

## 2. Developer Workflows

### Local Development

The primary workflow is Docker-based. To start the full development environment:

```bash
make dev
```

This command uses `docker-compose.dev.yml` to build and run the frontend and backend containers with hot-reloading enabled.

### Database Migrations

The backend uses Prisma for database management. When you modify the `Backend/prisma/schema.prisma` file, you must create and apply a new migration:

```bash
# Open a shell into the running backend container
make shell-backend

# Run the Prisma migrate command
pnpm run db:migrate
```

### Running Tests

-   **Backend**: The backend has scripts for testing specific functionalities. For example, `test-login.js` can be used to test the authentication flow.
-   **Frontend**: The frontend uses `eslint` for linting. Run `pnpm lint` in the `frontend-nextjs` directory.

## 3. Project-Specific Conventions

### Backend

-   **Modular Routers**: API routes are organized by feature in `Backend/src/router/`. Each router (e.g., `auth.router.ts`, `course.router.ts`) is self-contained.
-   **Repository Pattern**: Database interactions are abstracted into repositories (e.g., `Backend/src/repositories/course.repository.ts`). This separates data access logic from service-layer business logic.
-   **Middleware**: Common concerns like authentication (`auth.middleware.ts`), error handling (`errorHandler.middleware.ts`), and input validation (`validation.middleware.ts`) are handled in dedicated middleware files.
-   **Prisma Schema**: The single source of truth for the database schema is `Backend/prisma/schema.prisma`. It includes models for users, courses, payments, and authentication, fully integrated with `next-auth`.

### Frontend

-   **Component Structure**: Reusable UI components are located in `frontend-nextjs/src/components/`.
-   **Authentication**: The `frontend-nextjs/src/hooks/AuthContext.tsx` provides a custom hook (`useAuth`) for managing user sessions and authentication state across the application.
-   **Styling**: The project uses Tailwind CSS 4. Utility classes should be used for styling.
-   **State Management**: For client-side state, React hooks (`useState`, `useContext`) are preferred.

## 4. Integration Points

-   **Authentication**: `next-auth` is used for authentication. The backend's `auth.router.ts` and the frontend's `AuthContext.tsx` are the key integration points.
-   **Payments**: Razorpay is the payment gateway. The payment flow is handled by `payment.controller.ts` and `payment.router.ts` on the backend.
-   **Database**: All database interactions are managed through Prisma. The client is initialized in `Backend/src/utils/prisma.ts`.

By following these guidelines, you can contribute effectively to the Skillyug project.
