# Skillyug 2.0: System Architecture and Design

This document provides a comprehensive overview of the Skillyug 2.0 application's architecture, technology stack, and design principles.

## 1. Overview

Skillyug 2.0 is a modern e-learning platform designed to provide a seamless experience for students, mentors, and administrators. It features a decoupled architecture with a Next.js frontend and an Express.js backend, enabling scalability, maintainability, and a rich user experience.

The platform supports key functionalities including user authentication, course management, payment processing, role-based access control, and **live interactive classes** powered by Amazon IVS (Interactive Video Service) for real-time streaming and engagement.

## 2. Technology Stack

The application is built using a modern, robust, and scalable technology stack.

### Frontend
- **Framework**: Next.js (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Hooks, Context API, and NextAuth.js for session management
- **API Communication**: Axios
- **Form Management**: React Hook Form with Zod for validation
- **Video Player**: Amazon IVS Player SDK for low-latency live video playback
- **Real-time Features**: WebSocket client for live chat, polls, and Q&A
- **Broadcasting**: OBS Studio integration for instructors

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens) and NextAuth.js integration
- **API Specification**: RESTful API
- **Security**: Helmet, CORS, express-rate-limit
- **Live Streaming**: Amazon IVS SDK for channel management and stream keys
- **Real-time Communication**: WebSocket support for live chat and interactions

### Database
- **Type**: PostgreSQL
- **Schema Management**: Prisma Migrate

### Cloud Services & AWS Infrastructure
- **Compute**: AWS ECS with Fargate for containerized backend services (Node.js/Express)
- **Database**: Amazon RDS for PostgreSQL for the primary database
- **Networking**: Amazon VPC, Route 53 for DNS, and Application Load Balancer (ALB) for traffic distribution
- **CDN & Frontend Hosting**: Amazon S3 for static frontend assets and Amazon CloudFront for global content delivery
- **Live Streaming**: Amazon IVS for low-latency live video streaming
- **Storage**: Amazon S3 for recorded class storage and user-generated content
- **Chat & Interactions**: Amazon IVS Chat for real-time messaging during live classes
- **CI/CD**: AWS CodePipeline, AWS CodeBuild, and AWS CodeDeploy for automated builds and deployments
- **Monitoring & Logging**: Amazon CloudWatch for application logs, metrics, and alarms
- **Security**: AWS IAM for access control, AWS WAF for web application firewall, and AWS Certificate Manager for SSL/TLS certificates

## 3. Architecture

The system follows a classic client-server architecture, with a clear separation of concerns between the frontend and backend.

### High-Level AWS Architecture
```
+------------------------------------------------------------------------------------------------+
|                                        AWS Cloud                                               |
|                                                                                                |
|  +-------------------------+      +-------------------------+      +-------------------------+  |
|  |   Route 53 (DNS)        |      |   CloudFront (CDN)      |      |   WAF & Shield          |  |
|  |  skillyug.com           |      |   - Frontend (S3)       |      |   (Security)            |  |
|  +-------------------------+      |   - Video Recordings    |      +-------------------------+  |
|              |                    +-------------------------+                  |                 |
|              |                                |                              |                 |
|              +--------------------------------+------------------------------+                 |
|                                               |                                                |
|                                +------------------------------+                                |
|                                |   Application Load Balancer  |                                |
|                                +------------------------------+                                |
|                                               |                                                |
|  +--------------------------------------------+--------------------------------------------+  |
|  |                                            |                                            |  |
|  |  +-------------------------+      +-------------------------+      +-------------------------+  |
|  |  |   ECS with Fargate      |      |   Amazon IVS            |      |   Amazon RDS            |  |
|  |  |   - Backend (Node.js)   |<---->|   - Live Streaming      |<---->|   (PostgreSQL)          |  |
|  |  |   - WebSocket Server    |      |   - Chat                |      |                         |  |
|  |  +-------------------------+      +-------------------------+      +-------------------------+  |
|  |              |                                |                              |                 |
|  |              +--------------------------------+------------------------------+                 |
|  |                                               |                                                |
|  |                                +------------------------------+                                |
|  |                                |   Amazon S3                  |                                |
|  |                                |   - Recordings & Assets      |                                |
|  |                                +------------------------------+                                |
|  |                                                                                                |
|  +------------------------------------------------------------------------------------------------+
|                                        VPC (Virtual Private Cloud)                               |
+------------------------------------------------------------------------------------------------+
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
- **`src/utils/`**: Contains utility functions and singleton instances (e.g., Prisma client, Razorpay instance, Amazon IVS client).
- **`src/services/live/`**: Handles live streaming functionality including:
    - **`ivs.service.ts`**: Amazon IVS channel management, stream key generation, and playback URLs
    - **`chat.service.ts`**: Real-time chat management for live classes
    - **`recording.service.ts`**: Automatic recording and S3 storage management
- **`src/websocket/`**: WebSocket server implementation for real-time features during live classes
- **`prisma/`**: Contains the Prisma schema (`schema.prisma`), database migrations, and seed scripts.

### Frontend Architecture

The frontend is built with Next.js using the App Router, which allows for a file-system-based routing and a clear project structure.

- **`src/app/`**: The main directory for the application's pages and layouts. Each folder represents a route.
- **`src/app/api/`**: Handles Next.js API routes, primarily for NextAuth.js authentication callbacks.
- **`src/components/`**: Contains reusable React components used throughout the application (e.g., `Navbar.tsx`, `Footer.tsx`).
    - **`live/`**: Live streaming specific components:
        - **`LivePlayer.tsx`**: Amazon IVS player component for students
        - **`LiveChat.tsx`**: Real-time chat component for live classes
        - **`StreamDashboard.tsx`**: Instructor dashboard for managing live streams
        - **`ViewerList.tsx`**: Live viewer count and management
- **`src/lib/`**: Contains core library functions.
    - **`api.ts`**: A centralized Axios instance for making API calls to the backend. It includes interceptors to automatically add authentication tokens to requests.
    - **`auth.ts`**: Configuration for NextAuth.js, defining authentication providers and session strategies.
    - **`ivs-player.ts`**: Amazon IVS Player SDK configuration and utilities
    - **`websocket.ts`**: WebSocket client for real-time communication
- **`src/hooks/`**: Contains custom React hooks.
    - **`useLiveStream.ts`**: Hook for managing live stream state and controls
    - **`useLiveChat.ts`**: Hook for real-time chat functionality
- **`src/pages/`**: Contains dashboard pages for different user roles.
    - **`live/`**: Live streaming pages for different user types

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

### Live Streaming System
- **Amazon IVS Integration**: 
  - **Channel Management**: Automatic creation of IVS channels for each live class
  - **Stream Keys**: Secure generation and distribution of stream keys for instructors
  - **Playback URLs**: Dynamic generation of playback URLs for students
  - **Auto-Recording**: Automatic recording of live sessions with S3 storage
  
- **Real-time Features**:
  - **Live Chat**: Real-time messaging during classes using Amazon IVS Chat
  - **Q&A Sessions**: Interactive question and answer functionality
  - **Polls & Quizzes**: Live polls and quizzes during streaming sessions
  - **Viewer Analytics**: Real-time viewer count and engagement metrics
  
- **Broadcasting Setup**:
  - **OBS Integration**: Instructors use OBS Studio with provided stream keys
  - **Quality Control**: Automatic bitrate and resolution optimization
  - **Backup Streaming**: Redundant streaming setup for reliability
  
- **Content Management**:
  - **Recording Storage**: Automatic upload to S3 with CDN distribution
  - **Thumbnail Generation**: Auto-generated thumbnails for recorded sessions
  - **Metadata Tracking**: Session duration, viewer count, and engagement data

## 5. Live Streaming Architecture Details

### Amazon IVS Integration Flow

```
Instructor                Student                 Backend                 Amazon IVS
    |                        |                       |                       |
    |-- Request Stream Key --|                       |                       |
    |                        |                       |-- Create Channel -----|
    |                        |                       |<-- Stream Key --------|
    |<-- Stream Key ---------|                       |                       |
    |                        |                       |                       |
    |-- Start OBS Stream ----|                       |                       |
    |------------------------|------------- Stream --|------ Ingest --------|
    |                        |                       |                       |
    |                        |-- Join Class ---------|                       |
    |                        |                       |-- Get Playback URL ---|
    |                        |<-- Playback URL ------|<-- Playback URL -----|
    |                        |<-- Live Stream -------|<----- Stream --------|
    |                        |                       |                       |
    |                        |-- Send Chat Msg ------|                       |
    |                        |                       |-- Broadcast Message --|
    |                        |<-- Chat Messages -----|<-- Real-time Chat ----|
```

### Database Schema Extensions

New tables added to support live streaming:

```sql
-- Live streaming sessions
model LiveSession {
  id              String    @id @default(cuid())
  courseId        String
  instructorId    String
  title           String
  description     String?
  scheduledAt     DateTime
  startedAt       DateTime?
  endedAt         DateTime?
  status          SessionStatus @default(SCHEDULED)
  
  // Amazon IVS specific fields
  ivsChannelArn   String?
  ivsStreamKey    String?
  ivsPlaybackUrl  String?
  ivsRecordingUrl String?
  
  // Analytics
  peakViewers     Int       @default(0)
  totalViewers    Int       @default(0)
  chatMessages    Int       @default(0)
  
  course          Course    @relation(fields: [courseId], references: [id])
  instructor      User      @relation(fields: [instructorId], references: [id])
  attendees       LiveAttendee[]
  chatMessages    LiveChatMessage[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

-- Session attendees tracking
model LiveAttendee {
  id            String      @id @default(cuid())
  sessionId     String
  userId        String
  joinedAt      DateTime    @default(now())
  leftAt        DateTime?
  watchDuration Int         @default(0) // in seconds
  
  session       LiveSession @relation(fields: [sessionId], references: [id])
  user          User        @relation(fields: [userId], references: [id])
  
  @@unique([sessionId, userId])
}

-- Live chat messages
model LiveChatMessage {
  id          String      @id @default(cuid())
  sessionId   String
  userId      String
  message     String
  messageType MessageType @default(CHAT)
  sentAt      DateTime    @default(now())
  
  session     LiveSession @relation(fields: [sessionId], references: [id])
  user        User        @relation(fields: [userId], references: [id])
}

enum SessionStatus {
  SCHEDULED
  LIVE
  ENDED
  CANCELLED
}

enum MessageType {
  CHAT
  QUESTION
  POLL_RESPONSE
  SYSTEM
}
```

### API Endpoints for Live Streaming

```typescript
// Live session management
POST   /api/live/sessions              // Create new live session
GET    /api/live/sessions              // Get instructor's sessions
GET    /api/live/sessions/:id          // Get session details
PUT    /api/live/sessions/:id          // Update session
DELETE /api/live/sessions/:id          // Cancel session

// Stream control
POST   /api/live/sessions/:id/start    // Start live stream
POST   /api/live/sessions/:id/end      // End live stream
GET    /api/live/sessions/:id/status   // Get stream status

// Student endpoints
GET    /api/live/sessions/:id/join     // Get playback URL for student
POST   /api/live/sessions/:id/leave    // Record student leaving

// Chat and interactions
GET    /api/live/sessions/:id/chat     // Get chat messages
POST   /api/live/sessions/:id/chat     // Send chat message
GET    /api/live/sessions/:id/viewers  // Get current viewers

// Analytics
GET    /api/live/sessions/:id/analytics // Get session analytics
GET    /api/live/analytics/dashboard    // Instructor analytics dashboard
```

## 6. Setup and Deployment

### Local Development
1.  **Prerequisites**: Node.js, pnpm, PostgreSQL, AWS Account with IVS access.
2.  **AWS Setup**:
    - Create AWS account and configure IAM user with IVS permissions
    - Set up IVS service in your preferred region
    - Create S3 bucket for recording storage
    - Configure CloudFront distribution for content delivery
3.  **Backend Setup**:
    - Navigate to the `Backend` directory.
    - Install dependencies: `pnpm install`
    - Create a `.env` file from `.env.development`.
    - Add AWS credentials and IVS configuration to `.env`
    - Run database migrations: `pnpm db:migrate`
    - Seed the database: `pnpm db:seed`
    - Start the server: `pnpm dev`
4.  **Frontend Setup**:
    - Navigate to the `frontend-nextjs` directory.
    - Install dependencies: `pnpm install`
    - Create a `.env.local` file from `.env.development`.
    - Start the development server: `pnpm dev`

### Deployment
- **Infrastructure as Code (IaC)**: AWS CloudFormation or Terraform will be used to define and manage the AWS infrastructure.
- **CI/CD Pipeline**:
  - **Source**: GitHub repository for frontend and backend code.
  - **Build**: AWS CodeBuild will compile the code, run tests, and create Docker images for the backend.
  - **Deploy**: AWS CodeDeploy will deploy the Docker containers to ECS with Fargate and the frontend to S3/CloudFront.
- **Backend**: Deployed as a containerized service on AWS ECS with Fargate for serverless container orchestration.
- **Frontend**: Hosted as a static site on Amazon S3, delivered globally via Amazon CloudFront for low latency.
- **Database**: A managed PostgreSQL instance on Amazon RDS with automated backups and scaling.
- **Live Streaming**: Amazon IVS channels and chat rooms are automatically managed through the backend API.
- **Storage**: Amazon S3 for recording storage with CloudFront CDN for global delivery.

### Environment Variables for Live Streaming

```bash
# Backend .env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
IVS_REGION=us-east-1
S3_BUCKET_NAME=skillyug-recordings
CLOUDFRONT_DOMAIN=your-cloudfront-domain.net

# Frontend .env.local
NEXT_PUBLIC_IVS_PLAYER_URL=https://player.live-video.net/1.21.0/amazon-ivs-player.min.js
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:5000
NEXT_PUBLIC_CDN_URL=https://your-cloudfront-domain.net
```

For detailed instructions, refer to `FRONTEND_BACKEND_CONNECTION.md` and `ENVIRONMENT_SETUP.md`.
