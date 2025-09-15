# Skillyug 2.0: System Architecture and Design

This document provides a comprehensive overview of the Skillyug 2.0 application's architecture, technology stack, and design principles.

## 1. Overview

Skillyug 2.0 is a modern e-learning platform designed to provide a seamless experience for students, mentors, and administrators. It features a decoupled architecture with a Next.js frontend and an Express.js backend, enabling scalability, maintainability, and a rich user experience.

The platform supports key functionalities including user authentication, course management, payment processing, and role-based access control.

## 2. Technology Stack

The application is built using a modern, robust, and scalable technology stack.

### Frontend
- **Framework**: Next.js (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Hooks, Context API, and NextAuth.js for session management
- **API Communication**: Axios
- **Form Management**: React Hook Form with Zod for validation

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens) and NextAuth.js integration
- **API Specification**: RESTful API
- **Security**: Helmet, CORS, express-rate-limit

### Database
- **Type**: PostgreSQL
- **Schema Management**: Prisma Migrate

## 3. Architecture

The system follows a classic client-server architecture, with a clear separation of concerns between the frontend and backend.

### High-Level Architecture
```
+-------------------+      +----------------------+      +--------------------+
|  Frontend         |      |  Backend             |      |  Database          |
|  (Next.js)        |<---->|  (Express.js)        |<---->|  (PostgreSQL)      |
|  Port: 3000       |      |  Port: 5000          |      |  Port: 5432        |
+-------------------+      +----------------------+      +--------------------+
        ^                            ^                             ^
        |                            |                             |
+-------------------+      +----------------------+      +--------------------+
|  User Browser     |      |  External Services   |      |  Prisma Studio     |
+-------------------+      |  (Razorpay, SMTP)    |      +--------------------+
```

### Backend Architecture

The backend is structured in a modular and layered fashion to promote separation of concerns and maintainability.

- **`src/index.ts`**: The main entry point of the application. It initializes the Express server, sets up middleware (CORS, Helmet, rate limiting), connects to the database, and mounts the routers.
- **`src/router/`**: Defines the API routes. Each router corresponds to a specific domain (e.g., `auth.router.ts`, `course.router.ts`). It connects the routes to the corresponding controller functions and applies route-specific middleware like validation.
- **`src/controllers/`**: Handles the incoming HTTP requests. It extracts data from the request, calls the appropriate service layer functions, and sends back the HTTP response.
- **`src/services/`**: Contains the core business logic of the application. It interacts with the repository layer to access the database and performs the necessary operations.
- **`src/repositories/`**: The data access layer. It uses Prisma to interact with the database, abstracting the database queries from the service layer.
- **`src/middleware/`**: Contains custom middleware for handling authentication, error handling, and input validation.
- **`src/validators/`**: Defines Zod schemas for validating incoming request bodies.
- **`src/utils/`**: Contains utility functions and singleton instances (e.g., Prisma client, Razorpay instance).
- **`prisma/`**: Contains the Prisma schema (`schema.prisma`), database migrations, and seed scripts.

### Frontend Architecture

The frontend is built with Next.js using the App Router, which allows for a file-system-based routing and a clear project structure.

- **`src/app/`**: The main directory for the application's pages and layouts. Each folder represents a route.
- **`src/app/api/`**: Handles Next.js API routes, primarily for NextAuth.js authentication callbacks.
- **`src/components/`**: Contains reusable React components used throughout the application (e.g., `Navbar.tsx`, `Footer.tsx`).
- **`src/lib/`**: Contains core library functions.
    - **`api.ts`**: A centralized Axios instance for making API calls to the backend. It includes interceptors to automatically add authentication tokens to requests.
    - **`auth.ts`**: Configuration for NextAuth.js, defining authentication providers and session strategies.
- **`src/hooks/`**: Contains custom React hooks.
- **`src/pages/`**: Contains dashboard pages for different user roles.

## 4. Key Features

### Authentication
- **Email/Password Login**: Secure login with bcrypt password hashing.
- **OTP Verification**: Email-based One-Time Password for account verification and password resets.
- **Role-Based Access Control (RBAC)**: Different user roles (Student, Mentor, Admin) with different permissions.
- **Session Management**: Handled by NextAuth.js with JWT sessions.

### Security
- **Rate Limiting**: Protects against brute-force attacks on authentication endpoints.
- **Input Validation**: Zod schemas on the backend and frontend to ensure data integrity.
- **CORS**: Configured to only allow requests from the frontend URL.
- **Helmet**: Sets various HTTP headers to secure the Express app.
- **SQL Injection Protection**: Provided by Prisma's query builder.

### Payment Integration
- **Razorpay**: Integrated for processing payments for course purchases.
- The flow involves creating an order on the backend, capturing the payment on the frontend with the Razorpay checkout, and verifying the payment on the backend.

## 5. Setup and Deployment

### Local Development
1.  **Prerequisites**: Node.js, pnpm, PostgreSQL.
2.  **Backend Setup**:
    - Navigate to the `Backend` directory.
    - Install dependencies: `pnpm install`
    - Create a `.env` file from `.env.development`.
    - Run database migrations: `pnpm db:migrate`
    - Seed the database: `pnpm db:seed`
    - Start the server: `pnpm dev`
3.  **Frontend Setup**:
    - Navigate to the `frontend-nextjs` directory.
    - Install dependencies: `pnpm install`
    - Create a `.env.local` file from `.env.development`.
    - Start the development server: `pnpm dev`

### Deployment
- **Backend**: Can be deployed to platforms like Vercel, Railway, or any service that supports Node.js applications.
- **Frontend**: Vercel is the recommended platform for deploying Next.js applications.
- **Database**: A managed PostgreSQL provider like Neon, Supabase, or AWS RDS is recommended for production.

For detailed instructions, refer to `FRONTEND_BACKEND_CONNECTION.md` and `ENVIRONMENT_SETUP.md`.
